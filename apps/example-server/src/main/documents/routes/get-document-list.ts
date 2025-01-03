import { createRoute, z } from '@hono/zod-openapi'
import { AppRouteHandler } from '../../../core/core.type'
import { OK } from 'stoker/http-status-codes'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectDocument } from '../documents.schema'
import { getAllDocuments } from '../documents.service'
import { checkToken } from '../../auth/auth.middleware'

export const getDocumentsListRoute = createRoute({
    path: '/v1/documents',
    tags: ['Document'],
    method: 'get',
    middleware: [checkToken] as const,
    request: {
        query: z.object({
            entityName: z.string().optional(),
            entityId: z.string().optional(),
            search: z.string().optional(),
            page: z.number().min(1).optional().default(1),
            limit: z.number().min(1).max(100).optional().default(10),
        }),
    },
    responses: {
        [OK]: ApiResponse(z.array(zSelectDocument), 'List of documents'),
    },
})

export const getDocumentsListHandler: AppRouteHandler<
    typeof getDocumentsListRoute
> = async (c) => {
    const payload = await c.get('jwtPayload')
    const { entityName, entityId, search, page, limit } = c.req.query()

    const pageNumber = Number(page)
    const limitNumber = Number(limit)

    const { groupId } = payload || {}
    const { data, meta } = await getAllDocuments({
        entityName,
        entityId,
        groupId,
        search,
        page: pageNumber,
        limit: limitNumber,
    })

    return c.json(
        {
            data: data,
            pagination: {
                page: meta.page,
                size: meta.limit,
                total: meta.totalCount,
            },
            message: 'Documents list',
            success: true,
        },
        OK,
    )
}
