import "dotenv/config";
import { notificationsQueue } from "../src/queues/index.js";
import { closeQueues } from "../src/queues/index.js";
import { closeRedisConnection } from "../src/redis.js";
/**
 * Seed script to enqueue a test job
 * Useful for testing queue connectivity and worker processing
 */
async function seed() {
    console.log("[Seed] Enqueuing test ping job to notifications queue...");
    try {
        const job = await notificationsQueue.add("ping", {
            type: "ping",
            payload: {
                message: "Hello from seed script!",
                timestamp: new Date().toISOString(),
            },
        });
        console.log(`[Seed] ✅ Job enqueued successfully!`);
        console.log(`[Seed] Job ID: ${job.id}`);
        console.log(`[Seed] Job data:`, job.data);
    }
    catch (error) {
        console.error("[Seed] ❌ Failed to enqueue job:", error);
        process.exit(1);
    }
    finally {
        // Close connections
        await closeQueues();
        await closeRedisConnection();
        process.exit(0);
    }
}
seed().catch((error) => {
    console.error("[Seed] Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map