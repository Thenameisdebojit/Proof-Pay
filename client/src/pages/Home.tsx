import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-8 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">ProofPay</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">Select your role to continue:</p>
          <div className="grid gap-4">
            <Link href="/dashboard/funder">
              <Button className="w-full" variant="outline">Funder Dashboard</Button>
            </Link>
            <Link href="/dashboard/beneficiary">
              <Button className="w-full" variant="outline">Beneficiary Dashboard</Button>
            </Link>
            <Link href="/dashboard/verifier">
              <Button className="w-full" variant="outline">Verifier Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
