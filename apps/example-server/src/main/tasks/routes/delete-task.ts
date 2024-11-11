import { createRoute, z } from '@hono/zod-openapi'
import { OK, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { authMiddleware } from '../../../core/middlewares/auth.middleware'
import checkTaskOwnershipMiddleware from '../../../core/middlewares/check-ownership.middleware'
import { tasksTable } from '../../../core/db/schema'
import { deleteTask, getTaskById } from '../tasks.service'

const jsonResponse = (data: any, message: string, status: number) => ({
    data,
    message,
    status,
})

export const deleteTaskRoute = createRoute({
    path: '/v1/tasks/:id',
    method: 'delete',
    tags: ['Task'],
    middleware: [
        authMiddleware,
        checkTaskOwnershipMiddleware(tasksTable, 'Task'),
    ],
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Task deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Task not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const deleteTaskHandler: AppRouteHandler<
    typeof deleteTaskRoute
> = async (c) => {
    const id = c.req.param('id')

    try {
        const task = await getTaskById(id)
        if (!task) {
            return c.json(
                jsonResponse({}, 'Task not found', NOT_FOUND),
                NOT_FOUND,
            )
        }

        await deleteTask(id)
        return c.json(jsonResponse('', 'Task deleted successfully', OK), OK)
    } catch (error) {
        console.error(
            'Error deleting task:',
            error instanceof Error ? error.message : 'Unknown error',
        )
        if (error instanceof Error) console.error(error.stack)
        return c.json(
            jsonResponse({}, 'Failed to delete task', INTERNAL_SERVER_ERROR),
            INTERNAL_SERVER_ERROR,
        )
    }
}