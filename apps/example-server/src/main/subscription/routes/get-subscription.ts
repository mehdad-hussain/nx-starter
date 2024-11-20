import { createRoute, z } from '@hono/zod-openapi'
import { NOT_FOUND, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { authMiddleware } from '../../../core/middlewares/auth.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zSelectSubscription } from '../subscription.schema'
import { findById } from '../subscriptions.service'

export const getSubscriptionRoute = createRoute({
    path: '/v1/subscriptions/:id',
    tags: ['Subscriptions'],
    method: 'get',
    middleware: [authMiddleware],
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(zSelectSubscription, 'Subscription details'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Subscription not found'),
    },
})

export const getSubscriptionHandler: AppRouteHandler<
    typeof getSubscriptionRoute
> = async (c) => {
    const id = c.req.param('id')
    const subscription = await findById(id)

    if (!subscription) {
        return c.json(
            { data: {}, message: 'Subscription not found', success: false },
            NOT_FOUND,
        )
    }
    return c.json(
        { data: subscription, message: 'Subscription details', success: true },
        OK,
    )
}
