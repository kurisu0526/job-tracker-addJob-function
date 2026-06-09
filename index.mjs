import { addJob } from './addJob.mjs';

export const handler = async (event) => {
    try {
        const result = await addJob(event);

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (err) {
        return {
            statusCode: 401,
            body: JSON.stringify({
                message: 'There was an error adding the job. Please try again later.',
            })
        };
    }
};