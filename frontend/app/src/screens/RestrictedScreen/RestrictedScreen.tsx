import { VFlex } from "@liquity2/uikit";
import { css } from "@/styled-system/css";

export const RestrictedPage = () => {
  return (
    <VFlex
      className={css({
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
      })}
    >
      <VFlex
        className={css({
          gap: "24px",
          maxWidth: "600px",
        })}
      >
        <div
          className={css({
            fontSize: "32px",
            fontWeight: "bold",
          })}
        >
          Access Restricted
        </div>
        <div
          className={css({
            fontSize: "16px",
            color: "contentAlt",
          })}
        >
          Access to our platform is unavailable in your region. This restriction
          is in compliance with applicable laws and regulations.
        </div>
      </VFlex>
    </VFlex>
  );
};
