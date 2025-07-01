import { Button, Modal } from "@liquity2/uikit";
import { css } from "@/styled-system/css";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { Logo } from "../Logo/Logo";
import { LinkTextButton } from "../LinkTextButton/LinkTextButton";
import content from "@/src/content";
import { useSignOnboardMessage } from "tos-onboard-provider";

export const OnboardModal = ({
  visible,
  onClose,
  onSigned,
}: {
  visible: boolean;
  onClose: VoidFunction;
  onSigned?: VoidFunction;
}) => {
  const { address = "0x" } = useAccount();
  const { isSigning, sign, isSuccess } = useSignOnboardMessage({ onSigned });

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [onClose, isSuccess]);

  const shortAddress = `${address.substring(0, 6)}...${address.substring(38)}`;

  return (
    <Modal
      visible={visible}
      onClose={() => {}}
      maxWidth={400}
      withCloseButton={false}
    >
      <div
        className={css({
          padding: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: 8,
          gap: 24,
        })}
      >
        <div
          className={css({
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
          })}
        >
          <Logo size={32} />
          <div
            className={css({
              fontSize: 16,
              fontWeight: 600,
            })}
          >
            {content.appName}
          </div>
        </div>
        <div
          className={css({
            background: "#F5F6F6",
            borderRadius: 8,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            width: "100%",
          })}
        >
          <div
            className={css({
              color: "#3F3F3F",
              fontWeight: 500,
              fontSize: 16,
              lineHeight: 1.5,
            })}
          >
            {shortAddress}
          </div>
          <div
            className={css({
              color: "text:grey",
              fontSize: 14,
              fontWeight: 400,
              lineHeight: 1.5,
            })}
          >
            To access {content.appName}, please sign the message with your
            wallet to continue.
          </div>
          <div
            className={css({
              color: "text:grey",
              fontSize: 14,
              fontWeight: 400,
              lineHeight: 1.5,
            })}
          >
            * This action does not involve any transaction
          </div>
        </div>
        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: 16,
            width: "100%",
          })}
        >
          <Button
            mode="primary"
            disabled={isSigning}
            label={isSigning ? "Signing..." : "Sign"}
            // size="large"
            onClick={sign}
          />
          <div
            className={css({
              color: "text:grey",
              fontSize: 12,
              fontWeight: 400,
              textAlign: "center",
            })}
          >
            By signing the message, you agree to {content.appName}'s{" "}
            <LinkTextButton
              href="https://docs.defidollar.io/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              label="Terms of Service"
            />
            .
          </div>
        </div>
      </div>
    </Modal>
  );
};
