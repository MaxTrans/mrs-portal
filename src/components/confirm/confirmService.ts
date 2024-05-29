import Confirmation, { Props as ConfimationProps } from '../../components/confirm/Confirmation';
import { createConfirmation } from 'react-confirm';

const defaultConfirmation = createConfirmation(Confirmation);

function confirm(confirmation: string, options: ConfimationProps = {}) {
    return defaultConfirmation({ confirmation, ...options });
}

export default confirm;

