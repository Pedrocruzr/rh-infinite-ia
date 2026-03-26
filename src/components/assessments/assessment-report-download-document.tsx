import AssessmentReportContent from "@/components/assessments/assessment-report-content";

type Props = {
  assessment: any;
};

export default function AssessmentReportDownloadDocument({ assessment }: Props) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{`Relatório Stacker - ${assessment?.candidate_name ?? assessment?.id}`}</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              * { box-sizing: border-box; }
              html, body { margin: 0; padding: 0; background: #fff; color: #0f172a; }
              body {
                font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                padding: 32px;
              }
              .report-shell {
                max-width: 1100px;
                margin: 0 auto;
              }
              h1, h2, h3, h4 {
                color: #0f172a;
                line-height: 1.25;
                margin: 0 0 12px;
              }
              p, li {
                line-height: 1.65;
                overflow-wrap: anywhere;
                margin: 0 0 12px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
                margin: 16px 0;
              }
              thead {
                display: table-header-group;
              }
              th, td {
                border: 1px solid #e5e7eb;
                padding: 10px 12px;
                vertical-align: top;
                text-align: left;
                overflow-wrap: anywhere;
              }
              img, table, pre, blockquote, section, article, .card, .block {
                break-inside: avoid;
                page-break-inside: avoid;
              }
              pre, code {
                white-space: pre-wrap;
                word-break: break-word;
              }
              @page {
                size: A4;
                margin: 16mm;
              }
              @media print {
                body {
                  padding: 0;
                }
              }
            `,
          }}
        />
      </head>
      <body>
        <div className="report-shell">
          <AssessmentReportContent assessment={assessment} />
        </div>
      </body>
    </html>
  );
}
