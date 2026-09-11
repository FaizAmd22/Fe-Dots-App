import type { Translate } from "../i18n/translate";

// Durasi relatif untuk kartu thread, reply, dan notifikasi: "2 hari" / "2 days".
// t dikirim pemanggil (hasil useTranslation), karena ini bukan komponen.
export default function changeFormatDate(date: string, t: Translate) {
    const duration = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(duration / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const day = Math.floor(hours / 24);
    const month = Math.floor(day / 30);
    const year = Math.floor(month / 12);

    // Bentuk tunggal dan jamak dipisah untuk bahasa Inggris ("1 day", "2 days");
    // di bahasa Indonesia keduanya sama.
    if (year >= 1) return t(year === 1 ? "time.year" : "time.years", { n: year });
    if (month >= 1) return t(month === 1 ? "time.month" : "time.months", { n: month });
    if (day >= 1) return t(day === 1 ? "time.day" : "time.days", { n: day });
    if (hours >= 1) return t(hours === 1 ? "time.hour" : "time.hours", { n: hours });
    if (minutes >= 1) return t(minutes === 1 ? "time.minute" : "time.minutes", { n: minutes });
    return t("time.justNow");
}
