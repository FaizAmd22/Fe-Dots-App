/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Flex, Image, Text, Stack, Button, IconButton, useToast } from '@chakra-ui/react'
import { FaCalendarDays } from "react-icons/fa6";
import { LuMessageCircle } from "react-icons/lu";
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import EditProfileModal from '../../../features/EditProfileModal';
import { useChatHooks } from '../../../hooks/chat';
import { useProfileHooks } from '../../../hooks/profile';
import { useSideProfileHooks } from '../../../hooks/sideProfile';
import { useSuggestionHooks } from '../../../hooks/suggestion';
import { API } from '../../../libs/axios';
import { selectProfile } from '../../../slices/profileSlice';
import { selectUser } from '../../../slices/userSlice';
import { selectLastSeenById, selectOnlineUserIds } from '../../../slices/chatSlice';
import PresenceLabel from '../../../features/PresenceLabel';

const HeroProfile = () => {
    const user = useSelector(selectProfile)
    // const [followed, setFollowed] = useState(user.isFollow)
    const currentUser = useSelector(selectUser)
    const onlineUserIds = useSelector(selectOnlineUserIds)
    const lastSeenById = useSelector(selectLastSeenById)
    // Tanggal gabung pemilik profil yang sedang dibuka, bukan milik user yang
    // login — dulu semua profil menampilkan tanggal gabung kita sendiri.
    const date = new Date(user.created_at)
    const formatedDate = date.toDateString()
    const token = sessionStorage.getItem("token")
    // console.log("currentUser :", currentUser.id);
    console.log("user :", user);
    // console.log("profile :", profile);
    const { fetchProfile } = useProfileHooks();
    const {fetchSuggestion} = useSuggestionHooks()
    const { fetchCurrentUser } = useSideProfileHooks();
    const { createConversation } = useChatHooks();
    const navigate = useNavigate();
    const toast = useToast();
    const [isOpeningChat, setIsOpeningChat] = useState<boolean>(false);

    // Backend mengembalikan percakapan lama kalau DM-nya sudah pernah ada, jadi
    // tombol ini aman ditekan berkali-kali tanpa membuat percakapan bertumpuk.
    const handleOpenChat = async () => {
        if (isOpeningChat) return;
        setIsOpeningChat(true);

        try {
            const conversationId = await createConversation([user.id]);
            navigate(`/chat/${conversationId}`);
        } catch (error: any) {
            toast({
                position: "top",
                title: error.response?.data?.message || "Gagal membuka percakapan!",
                status: "error",
                duration: 2000,
                isClosable: true,
            });
            setIsOpeningChat(false);
        }
    };

    const [isFollowPending, setIsFollowPending] = useState<boolean>(false);

    // Dulu tidak dikunci: klik ganda mengirim dua follow, dan yang kedua
    // ditolak server dengan "already follow".
    const handleFollow = async () => {
        if (isFollowPending) return;

        setIsFollowPending(true);
        try {
            await API.post(
                user.isFollow ? "/unfollow" : "/follow",
                { following: user.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Ditunggu supaya spinner baru hilang bersamaan dengan labelnya
            // berganti; dua lainnya tidak memengaruhi tombol ini.
            await fetchProfile();
            fetchCurrentUser();
            fetchSuggestion();
        } catch (error) {
            toast({
                position: "top",
                title: (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal memperbarui follow!",
                status: "error",
                duration: 2000,
                isClosable: true,
            });
        } finally {
            setIsFollowPending(false);
        }
    };
    
    return ( 
        <Stack
            color='white'
            // borderBottom='2px'
            // borderColor='gray.700'
            pb='5'
        >
            {/* Ukuran sampul dan avatar mengecil di layar kecil. Dulu sampul
                selalu 350px dan avatar 208px, sehingga di HP keduanya memenuhi
                layar dan nama profil terdorong ke balik navbar. */}
            <Image
                src={user.cover_photo ? user.cover_photo : 'https://i.pinimg.com/564x/70/38/f2/7038f235f718d1e43157fc5516a0aaa7.jpg'}
                w='100%'
                h={{ base: '150px', sm: '200px', md: '250px', xl: '350px' }}
                objectFit='cover'
                rounded='lg'
                mt='2'
            />

            <Flex
                justifyContent='space-between'
                alignItems='flex-end'
                gap='3'
                px={{ base: '2', md: '5' }}
                mt={{ base: '-48px', md: '-80px', xl: '-100px' }}
            >
                <Box
                    w={{ base: '24', md: '36', xl: '52' }}
                    h={{ base: '24', md: '36', xl: '52' }}
                    p={{ base: '1', md: '1.5', xl: '4' }}
                    rounded='full'
                    bg='#1D1D1D'
                    flexShrink={0}
                >
                    <Image
                        src={user.picture ? user.picture : 'https://i.pinimg.com/564x/c0/c8/17/c0c8178e509b2c6ec222408e527ba861.jpg'}
                        w='100%'
                        h='100%'
                        rounded='full'
                        objectFit="cover"
                    />
                </Box>

                {currentUser.id == user.id && (
                    <Box pb={{ base: '1', md: '3' }}>
                        <EditProfileModal />
                    </Box>
                )}
            </Flex>

            {/* flexWrap: nama panjang tidak lagi mendesak tombol keluar layar. */}
            <Flex gap='3' alignItems='center' flexWrap='wrap' rowGap='2'>
                <Text fontWeight='semibold' fontSize={{ base: '2xl', md: '3xl' }} wordBreak='break-word'>
                    {user.name}
                </Text>

                {(currentUser.id != user.id && token) && (
                    <>
                        <Button
                            size='sm'
                            px={{ base: '5', md: '8' }}
                            bg='none'
                            border='2px'
                            fontSize='sm'
                            rounded='full'
                            color={user.isFollow ? "gray.500" : "white"}
                            borderColor={user.isFollow ? "gray.500" : "white"}
                            _hover={{ bg: "none", color: "green.500", borderColor: "green.500" }}
                            isLoading={isFollowPending}
                            onClick={handleFollow}
                        >
                            {user.isFollow ? "Unfollow" : "Follow"}
                        </Button>

                        <IconButton
                            size='sm'
                            bg='none'
                            border='2px'
                            rounded='full'
                            color='white'
                            borderColor='white'
                            fontSize='xl'
                            aria-label={`Kirim pesan ke ${user.name}`}
                            title={`Kirim pesan ke ${user.name}`}
                            icon={<LuMessageCircle />}
                            isLoading={isOpeningChat}
                            _hover={{ bg: "none", color: "green.500", borderColor: "green.500" }}
                            onClick={handleOpenChat}
                        />
                    </>
                )}
            </Flex>
            <Text color='gray.500' mt='-2'>
                @{user.username}
            </Text>

            {/* Profil sendiri tidak perlu penanda online. */}
            {currentUser.id != user.id && (
                <PresenceLabel
                    fontSize='sm'
                    isOnline={onlineUserIds.includes(user.id)}
                    lastSeenAt={lastSeenById[user.id] || user.last_seen_at || null}
                />
            )}

            <Flex alignItems='center' gap='2' color='gray.500'>
                <FaCalendarDays />
                <Text>
                    Joined {formatedDate}
                </Text>
            </Flex>

            <Flex gap='4'>
                <Flex gap='1'>
                    <Text>
                        {user.follower}
                    </Text>
                    <Text color='gray.500'>
                        Followers
                    </Text>
                </Flex>

                <Flex gap='1'>
                    <Text>
                        {user.following}
                    </Text>
                    <Text color='gray.500'>
                        Following
                    </Text>
                </Flex>
            </Flex>
        </Stack>
    );
}

export default HeroProfile;