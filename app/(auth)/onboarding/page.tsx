import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardingPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome!</CardTitle>
        <CardDescription>
          Let&apos;s set up your profile to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground text-center">
          Onboarding wizard will be implemented here. This page guides new users
          through initial profile setup based on their role.
        </p>
      </CardContent>
    </Card>
  );
}
