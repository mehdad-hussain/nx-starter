import { createRoute, z } from '@hono/zod-openapi'
import { checkToken } from '../auth.middleware'
import { jsonContent } from 'stoker/openapi/helpers'
import { zInsertGroup, zSelectGroup } from '../../group/group.schema'
import { BAD_REQUEST, CREATED, OK } from 'stoker/http-status-codes'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { AppRouteHandler } from '../../../core/core.type'
import { db } from '../../../core/db/db'
import { groupsTable } from '../../../core/db/schema'
import { eq } from 'drizzle-orm'
import { zEmpty } from '../../../core/models/common.schema'
import { buildSuccessEmailTemplate } from '../../email/templates/success-template'
import { sendEmailUsingResend } from '../../../core/email/email.service'
import env from '../../../env'

export const createClientProfileRoute = createRoute({
    path: '/v1/create-client-profile',
    method: 'post',
    tags: ['Auth'],
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(zInsertGroup, 'Group create input'),
    },
    responses: {
        [CREATED]: ApiResponse(zSelectGroup, 'Client profile created'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid input'),
    },
})

export const createClientProfileHandler: AppRouteHandler<
    typeof createClientProfileRoute
> = async (c) => {
    const body = c.req.valid('json')
    const { sub: authUserId } = await c.get('jwtPayload')

    const clientExists = await db
        .select()
        .from(groupsTable)
        .where(eq(groupsTable.ownerId, authUserId))
        .limit(1)

    if (clientExists.length > 0) {
        return c.json(
            {
                success: false,
                message: 'Client profile already exists',
                data: {},
            },
            BAD_REQUEST,
        )
    }

    const [group] = await db
        .insert(groupsTable)
        .values({
            ...body,
            ownerId: authUserId,
        })
        .returning()

    const createProfileSuccess = buildSuccessEmailTemplate({
        recipientName: group.name,
        profileType: group.type,
        dashboardUrl: `${env.FRONTEND_URL}/dashboard`,
        organizationName: '',
    })

    const { data, error } = await sendEmailUsingResend(
        [group.email ?? ''],
        'Profile created successfully.',
        createProfileSuccess,
    )

    // TODO: log sending email error

    return c.json(
        { data: group, success: true, message: 'Client profile created' },
        CREATED,
    )
}