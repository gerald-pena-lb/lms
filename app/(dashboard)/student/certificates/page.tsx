import { getStudentCertificates } from "@/lib/student/actions";
import { CertificateList } from "@/components/student/certificate-list";

export default async function StudentCertificatesPage() {
  const result = await getStudentCertificates();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Certificates</h1>
        <p className="text-muted-foreground">
          View certificates earned from completed courses.
        </p>
      </div>

      <CertificateList
        certificates={result.data as Parameters<typeof CertificateList>[0]["certificates"]}
      />
    </div>
  );
}
