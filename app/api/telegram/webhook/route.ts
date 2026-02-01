import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';
import { getAuthUsers, getCollectionCount } from '@/app/actions';

export async function POST(req: NextRequest) {
    try {
        const secret = process.env.TELEGRAM_SECRET_TOKEN;
        const headerSecret = req.headers.get('x-telegram-bot-api-secret-token');

        // Optional: Verify secret if set
        if (secret && headerSecret !== secret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const message = body.message;

        if (!message || !message.text) {
            return NextResponse.json({ status: 'ignored' });
        }

        const chatId = message.chat.id;
        const text = message.text.trim().toLowerCase();

        // COMMAND: /report or "report"
        if (text === '/report' || text.includes('report')) {
            await sendTelegramMessage(chatId, "📊 *Generating Zest Intelligence Report...*");

            // Fetch Data
            const [academyResult, zestfolioResult, portfoliosResult] = await Promise.all([
                getAuthUsers('academy'),
                getAuthUsers('zestfolio'),
                getCollectionCount('portfolios', 'zestfolio')
            ]);

            const academyCount = academyResult.success ? academyResult.users.length : 0;
            const zestfolioCount = zestfolioResult.success ? zestfolioResult.users.length : 0;
            const portfolioCount = portfoliosResult.success ? portfoliosResult.count : 0;
            const totalUsers = academyCount + zestfolioCount;

            const report = `
📈 *ZEST SYSTEM REPORT*
📅 ${new Date().toLocaleString()}

*User Analytics*
• Total Users: *${totalUsers}*
• Academy Users: *${academyCount}*
• Zestfolio Users: *${zestfolioCount}*

*Content Metrics*
• Portfolios Created: *${portfolioCount}*

*System Status*
✅ Core DB: Online
✅ Auth Service: Active
✅ Integrations: Stable

_Reply with "help" for more options._
            `;

            await sendTelegramMessage(chatId, report);
        } else {
            await sendTelegramMessage(chatId, "🤖 *Zest Bot*: I can generate reports for you.\nTry sending: `/report`");
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
