import axios from 'axios';

const BASE_URL = 'http://localhost:3000/chat';

async function testApi() {
    console.log("Starting API Test...");

    let sessionId = "";

    // 1. Test Send Message
    try {
        console.log("Testing Send Message...");
        const res = await axios.post(`${BASE_URL}/message`, {
            message: "Hello, what are your shipping policies?"
        });
        console.log("✅ Message Sent. Reply:", res.data.reply);

        if (!res.data.sessionId) throw new Error("No sessionId returned");
        sessionId = res.data.sessionId;

    } catch (err: any) {
        console.error("❌ Send Message Failed:", err.response?.data || err.message);
        process.exit(1);
    }

    // 2. Test Get History
    try {
        console.log(`Testing Get History for session ${sessionId}...`);
        const res = await axios.get(`${BASE_URL}/history/${sessionId}`);

        if (!Array.isArray(res.data) || res.data.length === 0) {
            throw new Error("History is empty or invalid format");
        }
        console.log("✅ History Retrieved. Records:", res.data.length);

    } catch (err: any) {
        console.error("❌ Get History Failed:", err.response?.data || err.message);
        process.exit(1);
    }

    // 3. Test Invalid Input
    try {
        console.log("Testing Invalid Input...");
        await axios.post(`${BASE_URL}/message`, { message: "" });
        console.error("❌ Invalid Input Test Failed: Should have returned 400");
    } catch (err: any) {
        if (err.response?.status === 400) {
            console.log("✅ Invalid Input handled correctly (400)");
        } else {
            console.error("❌ Invalid Input Test Failed with unexpected error:", err.message);
        }
    }

    console.log("All Tests Passed! 🚀");
}

testApi();
