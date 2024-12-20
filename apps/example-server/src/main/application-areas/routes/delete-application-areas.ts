import { createRoute, z } from '@hono/zod-openapi'
import { OK, NOT_FOUND, INTERNAL_SERVER_ERROR } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { zEmpty } from '../../../core/models/common.schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { checkToken } from '../../auth/auth.middleware'
import {
    deleteApplicationArea,
    findApplicationAreaById,
} from '../application-areas.service'
import { zSelectAppointment } from '../../appointments/appointments.schema'

export const deleteApplicationAreaRoute = createRoute({
    path: '/v1/application-areas/:id',
    method: 'delete',
    tags: ['Application Area'],
    middleware: [checkToken] as const,
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'Application area deleted'),
        [NOT_FOUND]: ApiResponse(zEmpty, 'Application area not found'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const deleteApplicationAreaHandler: AppRouteHandler<
    typeof deleteApplicationAreaRoute
> = async (c) => {
    const areaId = c.req.param('id')

    try {
        const applicationArea = await findApplicationAreaById(areaId)
        if (!applicationArea) {
            return c.json(
                { data: {}, message: 'Not found', success: false },
                NOT_FOUND,
            )
        }
        await deleteApplicationArea(areaId)
        return c.json({ data: {}, message: 'Deleted', success: true }, OK)
    } catch (error) {
        console.error(
            'Error deleting application area:',
            error instanceof Error ? error.message : 'Unknown error',
        )
        if (error instanceof Error) console.error(error.stack)
        return c.json(
            { data: {}, message: 'Failed to delete', success: false },
            INTERNAL_SERVER_ERROR,
        )
    }
}
