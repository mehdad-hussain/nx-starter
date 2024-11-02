import { createRoute, z } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    OK,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { zInsertEvent, zSelectEvent } from '../events.schema'
import { createEvent, getAnEvent, updateEvent } from '../events.service'
import { authMiddleware } from '../../../core/middlewares/auth.middleware'

const jsonResponse = (data: any, message: string, status: number) => ({
    data,
    message,
    status,
})

export const updateEventRoute = createRoute({
    path: '/v1/event/:id',
    method: 'post',
    tags: ['Event'],
    middleware: [authMiddleware],
    request: {
        param: z.object({ id: z.string() }),
        body: jsonContent(zInsertEvent, 'Event details'),
    },
    responses: {
        [OK]: ApiResponse(zSelectEvent, 'Event updated successfully'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid event data'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Event not found'),
    },
})

export const updateEventHandler: AppRouteHandler<
    typeof updateEventRoute
> = async (c) => {
    const eventId = c.req.param('id')
    const body = c.req.valid('json')
    const payload = await c.get('jwtPayload')

    try {
        const existingEvent = await getAnEvent(eventId)
        if (!existingEvent) {
            return c.json(
                jsonResponse({}, 'Event not found', NOT_FOUND),
                NOT_FOUND,
            )
        }
        const updatedEvent = await updateEvent(eventId, payload.groupId, body)

        return c.json(
            jsonResponse(updatedEvent, 'Event created successfully', OK),
            OK,
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json(
                jsonResponse({}, 'Invalid event data', BAD_REQUEST),
                BAD_REQUEST,
            )
        }
        console.error(
            'Error updating event:',
            error instanceof Error ? error.message : 'Unknown error',
        )
        if (error instanceof Error) console.error(error.stack)
        return c.json(
            jsonResponse({}, 'Failed to create event', INTERNAL_SERVER_ERROR),
            INTERNAL_SERVER_ERROR,
        )
    }
}
