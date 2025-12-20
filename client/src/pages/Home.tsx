import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Shield, GraduationCap, Building2, CheckCircle2, Lock, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">ProofPay</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-medium">Log In</Button>
            </Link>
            <Link href="/register">
              <Button className="font-medium">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
          
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 mb-6">
              Now on Stellar Network
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent max-w-4xl mx-auto">
              Scholarships & Grants, <br/>
              <span className="text-primary">Verifiable & Instant.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              ProofPay revolutionizes funding distribution using Blockchain and Zero-Knowledge Proofs. 
              Secure, transparent, and automated.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 h-12 rounded-full shadow-lg hover:shadow-primary/25 transition-all">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                 <Button size="lg" variant="outline" className="text-lg px-8 h-12 rounded-full bg-background/50 backdrop-blur-sm">
                   View Demo
                 </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Why ProofPay?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built for trust and efficiency, our platform solves the key challenges in scholarship and grant disbursement.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Lock className="w-10 h-10 text-blue-500" />}
                title="Smart Contracts"
                description="Funds are locked securely and only released when specific, pre-defined conditions are met."
              />
              <FeatureCard 
                icon={<CheckCircle2 className="w-10 h-10 text-green-500" />}
                title="Verifiable Proofs"
                description="Students submit cryptographic proofs of enrollment or milestones that are instantly verified."
              />
              <FeatureCard 
                icon={<Zap className="w-10 h-10 text-amber-500" />}
                title="Instant Settlement"
                description="No more waiting days for bank transfers. Funds are settled instantly on the Stellar network."
              />
            </div>
          </div>
        </section>

        {/* Roles */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Ecosystem Roles</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <RoleCard 
                icon={<GraduationCap className="w-12 h-12 text-primary" />}
                title="Beneficiary"
                subtitle="Students & Researchers"
                description="Apply for grants, submit proofs of work or enrollment, and receive funds directly to your wallet."
              />
              <RoleCard 
                icon={<Building2 className="w-12 h-12 text-purple-600" />}
                title="Funder"
                subtitle="Universities & NGOs"
                description="Create funding programs, set release conditions, and track impact with transparent reporting."
              />
              <RoleCard 
                icon={<Shield className="w-12 h-12 text-emerald-600" />}
                title="Verifier"
                subtitle="Auditors & Oracles"
                description="Validate submitted proofs against real-world data to trigger smart contract releases."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform funding?</h2>
            <p className="text-primary-foreground/80 text-xl max-w-2xl mx-auto mb-10">
              Join the thousands of institutions and students already using ProofPay.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 h-12 rounded-full shadow-lg">
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold">ProofPay</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ProofPay Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
      <div className="mb-6 bg-muted/50 w-16 h-16 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function RoleCard({ icon, title, subtitle, description }: { icon: any, title: string, subtitle: string, description: string }) {
  return (
    <div className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all group">
      <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-2xl font-bold mb-1">{title}</h3>
      <p className="text-primary font-medium mb-4">{subtitle}</p>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
