import { createRoute, z } from '@hono/zod-openapi'
import { inArray } from 'drizzle-orm'
import { INTERNAL_SERVER_ERROR, OK } from 'stoker/http-status-codes'
import { AppRouteHandler } from '../../../core/core.type'
import { db } from '../../../core/db/db'
import { usersTable } from '../../../core/db/schema'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { checkToken } from '../../auth/auth.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import { jsonContent } from 'stoker/openapi/helpers'

export const deleteUsersRoute = createRoute({
    path: '/v1/users/delete',
    method: 'delete',
    tags: ['User'],
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(
            z.object({ ids: z.array(z.string()) }),
            'User IDs to delete',
        ),
    },
    responses: {
        [OK]: ApiResponse(
            z.object({ deletedCount: z.number() }),
            'Users deleted successfully',
        ),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal server error'),
    },
})

export const deleteUsersHandler: AppRouteHandler<
    typeof deleteUsersRoute
> = async (c) => {
    try {
        const body = c.req.valid('json')

        // Delete users by IDs
        const result = await db
            .delete(usersTable)
            .where(inArray(usersTable.id, body.ids))

        return c.json(
            {
                data: { deletedCount: result.rowCount || 0 }, // Number of rows affected
                message: 'Users deleted successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        return c.json(
            {
                data: {},
                message: 'Failed to delete users',
                success: false,
                error,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
