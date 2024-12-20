import { createRoute, z } from '@hono/zod-openapi'
import { OK, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { checkToken } from '../../auth/auth.middleware'
import { jsonContent } from 'stoker/openapi/helpers'
import { deleteAll } from '../documents.service'

export const deleteAllDocumentRoute = createRoute({
    path: '/v1/documents',
    method: 'delete',
    tags: ['Document'],
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(
            z.object({ ids: z.array(z.string()) }),
            'Task details',
        ),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Document deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Document not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const deleteAllDocumentHandler: AppRouteHandler<
    typeof deleteAllDocumentRoute
> = async (c) => {
    const body = c.req.valid('json')
    const payload = await c.get('jwtPayload')

    try {
        for (const id of body.ids) {
            await deleteAll(id, payload.groupId)
        }
    } catch (error) {
        console.error(
            'Error deleting documents:',
            error instanceof Error ? error.message : 'Unknown error',
        )
        if (error instanceof Error) console.error(error.stack)
        return c.json(
            { data: {}, message: 'Internal Server Error', success: false },
            INTERNAL_SERVER_ERROR,
        )
    }
    return c.json(
        { data: {}, message: 'Documents deleted successfully', success: true },
        OK,
    )
}
