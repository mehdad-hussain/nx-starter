import { createRoute, z } from '@hono/zod-openapi'
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { jsonContent } from 'stoker/openapi/helpers'
import { checkToken } from '../../auth/auth.middleware'
import { deleteAllTask } from '../tasks.service'

export const deleteManyTaskRoute = createRoute({
    path: '/v1/tasks',
    method: 'delete',
    tags: ['Task'],
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(
            z.object({ ids: z.array(z.string()) }),
            'Task details',
        ),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Task deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Task not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const deleteManyTaskHandler: AppRouteHandler<
    typeof deleteManyTaskRoute
> = async (c) => {
    const body = c.req.valid('json')
    const payload = await c.get('jwtPayload')

    try {
        for (const taskId of body.ids) {
            await deleteAllTask(taskId, payload.groupId)
        }
    } catch (error) {
        console.error(
            'Error deleting task:',
            error instanceof Error ? error.message : 'Unknown error',
        )
        if (error instanceof Error) console.error(error.stack)
        return c.json(
            { data: {}, message: 'Internal Server Error', success: false },
            INTERNAL_SERVER_ERROR,
        )
    }
    return c.json(
        { data: {}, message: 'Tasks deleted successfully', success: true },
        OK,
    )
}
