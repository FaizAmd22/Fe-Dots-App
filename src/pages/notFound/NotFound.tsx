import { Text } from '@chakra-ui/react'
import { useTranslation } from '../../i18n/useTranslation';

const NotFound = () => {
    const { t } = useTranslation();

    return (
        <Text>{t("misc.notFound")}</Text>
     );
}

export default NotFound;
