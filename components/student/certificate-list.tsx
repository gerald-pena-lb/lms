"use client";

import { Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Certificate {
  id: string;
  issued_at: string;
  certificate_url: string | null;
  courses: { title: string } | null;
}

export function CertificateList({ certificates }: { certificates: Certificate[] }) {
  if (certificates.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        No certificates earned yet. Complete courses to earn certificates!
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {certificates.map((cert) => (
        <Card key={cert.id} className="overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/10 p-6 flex items-center justify-center">
            <Award className="h-16 w-16 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{cert.courses?.title ?? "Course Certificate"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Issued {new Date(cert.issued_at).toLocaleDateString()}
            </p>
            {cert.certificate_url && (
              <a
                href={cert.certificate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline mt-2 inline-block"
              >
                View Certificate
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
