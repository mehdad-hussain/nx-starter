import { createRoute, z } from '@hono/zod-openapi'
import { OK, NOT_FOUND } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { checkToken } from '../../auth/auth.middleware'
import { zSelectCase } from '../case.schema'
import { findCasesByGroupId } from '../case.service'

export const getCasesRoute = createRoute({
    path: '/v1/cases',
    method: 'get',
    tags: ['Case'],
    middleware: [checkToken] as const,
    request: {},
    responses: {
        [OK]: ApiResponse(z.array(zSelectCase), 'List of Cases'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'No cases found'),
    },
})

export const getCasesHandler: AppRouteHandler<typeof getCasesRoute> = async (
    c,
) => {
    const payload = await c.get('jwtPayload')
    const groupId = payload?.groupId

    if (!groupId) {
        return c.json(
            { message: 'Group ID is required', data: {}, success: false },
            NOT_FOUND,
        )
    }

    const cases = await findCasesByGroupId(groupId)

    if (cases.length === 0) {
        return c.json(
            { data: {}, message: 'No cases found', success: false },
            NOT_FOUND,
        )
    }

    return c.json({ data: cases, message: 'List of Cases', success: true }, OK)
}
