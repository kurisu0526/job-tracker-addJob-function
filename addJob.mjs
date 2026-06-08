import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'job-tracker';
const JOBDETAILS_INDEX = 'jobDetailsGSI';
const JOBDETAILS_GSIKEY = 'jobdetails_gsi_pk';
const JOBDETAILS_GSIKEY_SK = 'jobdetails_gsi_sk ';
const USER_PREFIX = 'USER#';
const JOB_PREFIX = 'JOB#';
const STATUS_PREFIX = 'STATUS#';

export async function addJob(event) {
    try {

        const body = JSON.parse(event.body || '{}');
        if (!body.position || !body.company) {
            throw new Error('Position and Company Name are required');
        }
        const jobId = uuidv4();
        const jobSK = `${JOB_PREFIX}${jobId}`;
        const now = new Date().toISOString();
        const status = body.status || 'Applied';
        const jobItem = {
            pk: `${USER_PREFIX}${userId}`,
            sk: jobSK,

            Type: 'JOB_APPLICATION',

            jobdetails_gsi_pk: `${USER_PREFIX}${userId}${STATUS_PREFIX}${status}`,
            jobdetails_gsi_sk: now,

            // 🔥 Query-friendly fields (important for GSIs later)
            Status: status,
            Company: body.company,

            // 🧠 Flexible structured data
            JobDetails: {
                position: body.position,
                location: body.location || null,
                appliedDate: body.appliedDate || now,
                salary: body.salary || null,
                notes: body.notes || null,
                tags: body.tags || [],
                url: body.url || null
            },

            CreatedAt: now,
            UpdatedAt: now
        };

        // 4. Save to DynamoDB
        await db.send(
            new PutCommand({
                TableName: TABLE,
                Item: jobItem
            })
        );

        return {
            success: true,
            message: 'Job added successfully',
            jobId: jobId
        };
        
    } catch (error) {
        throw new Error(error.message || 'Failed to add job');
    }
}