import { createRoute, z } from '@hono/zod-openapi'
import { OK, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { checkToken } from '../../auth/auth.middleware'
import { jsonContent } from 'stoker/openapi/helpers'
import { deleteSharing } from '../documents-sharing.service'

export const deleteAllDocumentSharingRoute = createRoute({
    path: '/v1/document-sharing',
    method: 'delete',
    tags: ['Document Sharing'],
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(
            z.object({ ids: z.array(z.string()) }),
            'Task details',
        ),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Document sharing deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Document sharing not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const deleteAllDocumentSharingHandler: AppRouteHandler<
    typeof deleteAllDocumentSharingRoute
> = async (c) => {
    const body = c.req.valid('json')

    try {
        for (const id of body.ids) {
            await deleteSharing(id)
        }
    } catch (error) {
        console.error(
            'Error deleting documents sharing:',
            error instanceof Error ? error.message : 'Unknown error',
        )
        if (error instanceof Error) console.error(error.stack)
        return c.json(
            { data: {}, message: 'Internal Server Error', success: false },
            INTERNAL_SERVER_ERROR,
        )
    }
    return c.json(
        {
            data: {},
            message: 'Document sharing deleted successfully',
            success: true,
        },
        OK,
    )
}
