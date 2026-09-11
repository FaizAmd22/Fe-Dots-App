import { Avatar, AvatarGroup, Box, Circle, Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { LuHeart, LuMessageCircle, LuUserPlus } from "react-icons/lu";
import changeFormatDate from "../../../features/ChangeFormatDate";
import { FALLBACK_AVATAR } from "../../../features/ChatHelpers";
import { darkenOnGroupHover } from "../../../features/HoverStyles";
import {
  INotification,
  NotificationType,
} from "../../../interfaces/NotificationInterface";
import type { Translate, TranslationKey } from "../../../i18n/translate";
import { useTranslation } from "../../../i18n/useTranslation";

const TYPE_META: Record<
  NotificationType,
  { icon: JSX.Element; color: string; actionKey: TranslationKey }
> = {
  follow: { icon: <LuUserPlus />, color: "green.500", actionKey: "notifications.follow" },
  like_thread: { icon: <LuHeart />, color: "red.500", actionKey: "notifications.likeThread" },
  like_reply: { icon: <LuHeart />, color: "red.500", actionKey: "notifications.likeReply" },
  reply: { icon: <LuMessageCircle />, color: "blue.400", actionKey: "notifications.reply" },
};

// "Budi", "Budi dan Ani", atau "Budi dan 3 lainnya".
const actorLabel = ({ actors, actorCount }: INotification, t: Translate) => {
  const [first, second] = actors;
  if (!first) return t("notifications.someone");
  if (actorCount <= 1) return first.name;
  if (actorCount === 2 && second) {
    return t("notifications.two", { first: first.name, second: second.name });
  }
  return t("notifications.many", { first: first.name, count: actorCount - 1 });
};

// Kutipan konten yang direspons: thread yang disukai, reply yang disukai, atau
// isi balasan yang masuk.
const previewText = (notification: INotification, t: Translate) => {
  const preview =
    notification.type === "like_thread" ? notification.thread : notification.reply;
  if (!preview) return null;
  return preview.content || (preview.image ? t("common.photo") : null);
};

const targetPath = (notification: INotification) => {
  if (notification.type === "follow") {
    // Beberapa follower sekaligus lebih enak dilihat di daftar Follows.
    return notification.actorCount === 1 && notification.actors[0]
      ? `/profile/${notification.actors[0].username}`
      : "/follows";
  }
  return notification.thread ? `/details/${notification.thread.id}` : null;
};

const NotificationCard = ({ notification }: { notification: INotification }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const meta = TYPE_META[notification.type] || TYPE_META.follow;
  const [firstActor] = notification.actors;
  const preview = previewText(notification, t);
  const path = targetPath(notification);

  return (
    <Flex
      role="group"
      gap="3"
      px="3"
      py="4"
      rounded="lg"
      cursor={path ? "pointer" : "default"}
      borderBottom="1px"
      borderColor="app.borderSubtle"
      // Yang belum dibaca tetap tersorot selama kunjungan ini, walaupun
      // di server sudah ditandai terbaca saat halaman dibuka.
      bg={notification.isRead ? "transparent" : "app.subtle"}
      transition="background-color 0.15s ease"
      _hover={{ bg: "app.hover" }}
      onClick={() => path && navigate(path)}
    >
      <Box position="relative" flexShrink={0} {...darkenOnGroupHover}>
        <Avatar
          w="44px"
          h="44px"
          name={firstActor?.name}
          src={firstActor?.picture || FALLBACK_AVATAR}
        />

        <Circle
          size="20px"
          position="absolute"
          bottom="-2px"
          right="-4px"
          bg={meta.color}
          color="app.text"
          fontSize="11px"
          border="2px"
          borderColor="app.bg"
        >
          {meta.icon}
        </Circle>
      </Box>

      <Box flex="1" minW="0">
        {notification.actorCount > 1 && (
          <AvatarGroup size="xs" max={5} mb="1.5" spacing="-1.5">
            {notification.actors.map((actor) => (
              <Avatar
                key={actor.id}
                name={actor.name}
                src={actor.picture || FALLBACK_AVATAR}
              />
            ))}
          </AvatarGroup>
        )}

        <Text fontSize="sm" lineHeight="short">
          <Text as="span" fontWeight="semibold">
            {actorLabel(notification, t)}
          </Text>{" "}
          {t(meta.actionKey)}
        </Text>

        {preview && (
          <Text fontSize="sm" color="app.textMuted" mt="1" noOfLines={2}>
            {preview}
          </Text>
        )}

        <Text fontSize="xs" color="gray.500" mt="1">
          {changeFormatDate(notification.created_at, t)}
        </Text>
      </Box>

      {!notification.isRead && (
        <Circle size="8px" bg="green.500" alignSelf="center" flexShrink={0} />
      )}
    </Flex>
  );
};

export default NotificationCard;
