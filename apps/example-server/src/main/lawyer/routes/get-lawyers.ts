import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectLawyer } from '../lawyer.schema'
import { getAllLawyers } from '../lawyer.service'

export const getLawyersRoute = createRoute({
    path: '/v1/lawyers',
    method: 'get',
    tags: ['Lawyer'],
    //! TODO: don't active
    // middleware: [checkToken, checkLevel([USER_LEVEL_ADMIN, USER_LEVEL_MODERATOR])] as const,
    request: {
        query: z.object({
            search: z.string().optional(),
            page: z.coerce.number().optional(),
            size: z.coerce.number().optional(),
            orderBy: z.string().optional(),
        }),
    },
    responses: {
        [OK]: ApiResponse(z.array(zSelectLawyer), 'List of Lawyers'),
    },
})

export const getLawyersHandler: AppRouteHandler<
    typeof getLawyersRoute
> = async (c) => {
    const { search, page, size, orderBy } = c.req.query()

    const pageNumber = Number(page)
    const limitNumber = Number(size)

    const { data, meta } = await getAllLawyers({
        search,
        page: pageNumber,
        size: limitNumber,
        orderBy,
    })

    return c.json(
        {
            data: data,
            pagination: {
                page: meta.page,
                size: meta.size,
                total: meta.totalCount,
            },
            message: 'Lawyer list',
            success: true,
        },
        OK,
    )
}
