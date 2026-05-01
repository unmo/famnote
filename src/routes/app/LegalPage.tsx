/**
 * 特定商取引法に基づく表示ページ
 * LegalPageLayoutを使って構成
 */
import { useTranslation } from "react-i18next";
import { Store } from "lucide-react";
import {
  LegalPageLayout,
  LegalSection,
  LegalTableRow,
} from "../../components/shared/LegalPageLayout";

export function LegalPage() {
  const { t } = useTranslation();

  // 目次アイテム
  const tocItems = [
    { id: "table", label: t("legal.toc.table", "表記事項テーブル") },
    { id: "notes", label: t("legal.toc.notes", "補足事項") },
  ];

  return (
    <LegalPageLayout
      pageTitle={t("legal.pageTitle", "特定商取引法に基づく表示")}
      icon={<Store className="w-7 h-7" />}
      lastUpdated={t("legal.lastUpdated", "最終更新日：2026年5月1日")}
      tocLabel={t("legal.tocLabel", "目次")}
      tocItems={tocItems}
    >
      {/* 冒頭説明 */}
      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-8 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        {t("legal.intro", "特定商取引法第11条の規定に基づき、以下の事項を表示します。")}
      </p>

      {/* 表記事項テーブル */}
      <LegalSection id="table" title={t("legal.toc.table", "表記事項テーブル")}>
        <dl className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <LegalTableRow label={t("legal.rows.seller", "販売業者")}>
            FamGrow
          </LegalTableRow>
          <LegalTableRow label={t("legal.rows.representative", "代表者名")}>
            {t("legal.disclosureOnRequest", "※請求に応じて遅滞なく開示します")}
          </LegalTableRow>
          <LegalTableRow label={t("legal.rows.address", "所在地")}>
            {t("legal.disclosureOnRequest", "※請求に応じて遅滞なく開示します")}
          </LegalTableRow>
          <LegalTableRow label={t("legal.rows.phone", "電話番号")}>
            <span className="text-zinc-500 dark:text-zinc-400">
              {t("legal.phoneNote", "お問い合わせはメールにて受け付けています：")}{" "}
              <a
                href="mailto:contact@fam-grow.com"
                className="hover:underline"
                style={{ color: "var(--color-brand-primary, #0EA5E9)" }}
              >
                contact@fam-grow.com
              </a>
            </span>
          </LegalTableRow>
          <LegalTableRow label={t("legal.rows.email", "メールアドレス")}>
            <a
              href="mailto:contact@fam-grow.com"
              className="hover:underline"
              style={{ color: "var(--color-brand-primary, #0EA5E9)" }}
            >
              contact@fam-grow.com
            </a>
          </LegalTableRow>
          <LegalTableRow label={t("legal.rows.serviceName", "サービス名")}>
            FamNote
          </LegalTableRow>
          <LegalTableRow label={t("legal.rows.price", "販売価格")}>
            <ul className="space-y-1">
              <li>
                <strong>{t("legal.price.free", "無料プラン：")}</strong>
                {t("legal.price.freeValue", "無料")}
              </li>
              <li>
                <strong>{t("legal.price.premium", "プレミアムプラン：")}</strong>
                {t("legal.price.premiumValue", "月額500円（税込）／年額5,000円（税込）")}
              </li>
            </ul>
          </LegalTableRow>
          <LegalTableRow label={t("legal.rows.payment", "支払方法")}>
            {t("legal.paymentMethod", "クレジットカード（Stripe決済）")}
            <br />
            <span className="text-xs text-zinc-500">
              {t("legal.paymentCards", "Visa / Mastercard / American Express / JCB")}
            </span>
          </LegalTableRow>
          <LegalTableRow label={t("legal.rows.paymentTiming", "支払時期")}>
            {t(
              "legal.paymentTiming",
              "お申し込み時に即時決済。月額プランは毎月、年額プランは毎年自動更新。"
            )}
          </LegalTableRow>
          <LegalTableRow label={t("legal.rows.serviceStart", "サービス提供時期")}>
            {t("legal.serviceStart", "お支払い完了後、即時利用可能。")}
          </LegalTableRow>
          <LegalTableRow label={t("legal.rows.cancellation", "キャンセル・返金について")}>
            <p>
              {t(
                "legal.cancellation1",
                "マイページの設定からいつでも解約できます。解約後は当該契約期間の終了日まで引き続きご利用いただけます。"
              )}
            </p>
            <p className="mt-1">
              {t(
                "legal.cancellation2",
                "既にお支払い済みの料金の返金は、法令に定める場合を除き原則として行いません。"
              )}
            </p>
          </LegalTableRow>
          <LegalTableRow label={t("legal.rows.environment", "動作環境")}>
            {t("legal.environment", "インターネット接続環境が必要です。")}
            <br />
            <span className="text-xs text-zinc-500">
              {t(
                "legal.environmentNote",
                "最新版のChrome・Safari・Edge・Firefoxを推奨します。"
              )}
            </span>
          </LegalTableRow>
        </dl>
      </LegalSection>

      {/* 補足事項 */}
      <LegalSection id="notes" title={t("legal.toc.notes", "補足事項")}>
        <p>{t("legal.note1", "本サービスは日本国内の法令に基づき運営しています。")}</p>
        <p>
          {t("legal.note2Prefix", "ご不明な点は")}{" "}
          <a
            href="mailto:contact@fam-grow.com"
            className="hover:underline"
            style={{ color: "var(--color-brand-primary, #0EA5E9)" }}
          >
            contact@fam-grow.com
          </a>{" "}
          {t("legal.note2Suffix", "までお問い合わせください。")}
        </p>
        <p>
          {t(
            "legal.note3",
            "本表示は予告なく変更する場合があります。最新の内容は本ページをご確認ください。"
          )}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-600 text-right pt-4">
          {t("legal.enacted", "制定：2026年5月1日")}
          <br />
          FamGrow
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
