import asyncio
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from main import handle_chat

BOT_TOKEN = "8942957007:AAEeiGgMeandDIu60pfBJBhL8ts2K8sXw7w"


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Hi, I'm SalesGenie, your AI stylist. What are you shopping for today?"
    )


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_message = update.message.text
    telegram_user_id = str(update.effective_user.id)

    # Telegram user ko apne existing customer se map karo (abhi ke liye fixed C001)
    customer_id = "C001"

    result = handle_chat(customer_id, user_message)

    reply_text = result["reply"]

    if result["recommendations"]:
        reply_text += "\n\n"
        for p in result["recommendations"]:
            reply_text += f"• {p['name']} — ₹{p['price_inr']}\n"

    await update.message.reply_text(reply_text)


def main():
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    print("Telegram bot chalu ho gaya...")
    app.run_polling()


if __name__ == "__main__":
    main()