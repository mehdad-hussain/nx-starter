import { createRoute, z } from '@hono/zod-openapi'
import { OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { checkToken } from '../../auth/auth.middleware'
import { zSelectUser } from '../user.schema'
import { findUsersByAuthUserId } from '../user.service'

const jsonResponse = (data: any, message: string, status: number) => ({
    data,
    message,
    status,
})

export const getMyProfilesRoute = createRoute({
    path: '/v1/my-profiles',
    method: 'get',
    tags: ['User'],
    middleware: [checkToken],
    responses: {
        [OK]: ApiResponse(
            {
                data: z.array(zSelectUser),
                message: z.string(),
                success: z.boolean(),
            },
            'List of user profiles by auth user ID',
        ),
    },
})

export const getMyProfilesHandler: AppRouteHandler<
    typeof getMyProfilesRoute
> = async (c) => {
    const payload = c.get('jwtPayload')
    const users = await findUsersByAuthUserId(payload.sub)

    return c.json(
        jsonResponse(users, 'List of user profiles by auth user ID', OK),
        OK,
    )
}
