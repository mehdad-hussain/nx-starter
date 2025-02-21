import { createRoute, z } from '@hono/zod-openapi'
import { OK, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { checkToken } from '../../auth/auth.middleware'
import { deleteManyEvent } from '../events.service'
import { jsonContent } from 'stoker/openapi/helpers'

export const deleteManyEventRoute = createRoute({
    path: '/v1/events',
    method: 'delete',
    tags: ['Event'],
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(
            z.object({ ids: z.array(z.string()) }),
            'Event details',
        ),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Event deleted successfully'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Event not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const deleteManyEventHandler: AppRouteHandler<
    typeof deleteManyEventRoute
> = async (c) => {
    const body = c.req.valid('json')
    const payload = await c.get('jwtPayload')

    try {
        for (const eventId of body.ids) {
            await deleteManyEvent(eventId, payload.groupId)
        }
    } catch (error) {
        console.error(
            'Error deleting event:',
            error instanceof Error ? error.message : 'Unknown error',
        )
        if (error instanceof Error) console.error(error.stack)
        return c.json(
            { data: {}, message: 'Internal Server Error', success: false },
            INTERNAL_SERVER_ERROR,
        )
    }
    return c.json(
        { data: {}, message: 'Events deleted successfully', success: true },
        OK,
    )
}
