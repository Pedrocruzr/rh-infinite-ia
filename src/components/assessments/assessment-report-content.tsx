type AssessmentReportContentProps = {
  assessment: any;
};

export default function AssessmentReportContent({
  assessment,
}: AssessmentReportContentProps) {
  return assessment.report_markdown ? (
    <div
      className="
        text-black
        [&_h1]:mb-8 [&_h1]:text-5xl [&_h1]:font-semibold [&_h1]:tracking-tight
        [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:text-3xl [&_h2]:font-semibold
        [&_h3]:mt-10 [&_h3]:mb-5 [&_h3]:text-2xl [&_h3]:font-semibold
        [&_p]:mb-4 [&_p]:text-[18px] [&_p]:leading-10
        [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-8
        [&_li]:mb-2 [&_li]:text-[18px] [&_li]:leading-10
        [&_table]:mb-8 [&_table]:w-full [&_table]:border-collapse
        [&_thead_th]:border-b [&_thead_th]:border-neutral-300 [&_thead_th]:px-4 [&_thead_th]:py-4 [&_thead_th]:text-left [&_thead_th]:text-[18px] [&_thead_th]:font-semibold
        [&_tbody_td]:border-b [&_tbody_td]:border-neutral-200 [&_tbody_td]:px-4 [&_tbody_td]:py-5 [&_tbody_td]:align-top [&_tbody_td]:text-[18px] [&_tbody_td]:leading-10
        [&_.meta-grid]:mb-10 [&_.meta-grid]:grid [&_.meta-grid]:gap-3
        [&_.meta-grid>div]:text-[18px] [&_.meta-grid>div]:leading-9
      "
      dangerouslySetInnerHTML={{ __html: assessment.report_markdown }}
    />
  ) : (
    <p className="text-neutral-500">Nenhum relatório disponível.</p>
  );
}
