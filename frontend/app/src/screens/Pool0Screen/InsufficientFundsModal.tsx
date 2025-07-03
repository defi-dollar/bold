import { css } from "@/styled-system/css";
import {
  BOLD_TOKEN_SYMBOL,
  Button,
  HFlex,
  Modal,
} from "@liquity2/uikit";
import Link from "next/link";

const InsufficientFundsModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal
      onClose={onClose}
      visible={visible}
      title="Insufficient funds"
      maxWidth={99999}
    >
      <div
        className={css({
          padding: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: 24,
          width: "calc(100vw - 128px - 48px)",
          maxWidth: 520,
          pt: 24,
        })}
      >
        <div>You don't have enough {BOLD_TOKEN_SYMBOL}.</div>
        <ol className={css({
          listStyleType: "decimal",
          paddingLeft: 16,
          marginLeft: 16,
        })}>
          <OptionRow
            label={`Deposit for more ${BOLD_TOKEN_SYMBOL}`}
            href="/"
          />
          <OptionRow label={`Buy ${BOLD_TOKEN_SYMBOL} in Curve`} href="/" />
          <OptionRow label={`Withdraw from stability pool`} href="/" />
        </ol>
      </div>
    </Modal>
  );
};

const OptionRow = ({ label, href }: { label: string; href: string }) => {
  return (
    <li className={css({
      paddingLeft: 8,
      marginBlock: 12,
    })}>
      <HFlex gap={32}>
        <div
          className={css({
            flex: 1,
          })}
        >
          {label}
        </div>
        <Link href={href}>
          <Button label="Continue" mode="primary" size="medium" />
        </Link>
      </HFlex>
    </li>
  );
};

export default InsufficientFundsModal;
