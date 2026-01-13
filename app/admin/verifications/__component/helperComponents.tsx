import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VerificationRequest } from "@/db/Schemas/ProfileVerificationRequest";

import { Badge as Badges, Building2, CheckCircle,  Clock, ExternalLink, FileCheck, FileText, GraduationCap, Hash, ImageIcon, Loader2, Sun, User, XCircle } from "lucide-react";
import Image from "next/image";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badges className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"><CheckCircle className="w-3.5 h-3.5 mr-1.5" />Verified</Badges>;
      case "rejected":
        return <Badges className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"><XCircle className="w-3.5 h-3.5 mr-1.5" />Rejected</Badges>;
      default:
        return <Badges className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"><Clock className="w-3.5 h-3.5 mr-1.5" />Pending Review</Badges>;
    }
  };
  const InfoGrid = ({ doc }: { doc: VerificationRequest }) => (
  <div>
    <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2"><User className="w-4 h-4"/> Student Information</h4>
    <div className="grid grid-cols-2 gap-4">
      <InfoItem icon={Hash} label="Roll Number" value={doc.rollNo} color="blue" />
      <InfoItem icon={Hash} label="Reg Number" value={doc.regNo} color="purple" />
      <InfoItem icon={Building2} label="Department" value={doc.department} color="emerald" />
      <InfoItem icon={GraduationCap} label="Semester" value={doc.semester} color="orange" />
      <div className="col-span-2"><InfoItem icon={Sun} label="Shift" value={doc.shift} color="amber" /></div>
    </div>
  </div>
);

const InfoItem = ({ icon: Icon, label, value, color }: any) => (
  <div className={`p-4 bg-linear-to-br from-${color}-50 to-white rounded-xl border border-${color}-100`}>
    <div className="flex items-center gap-2 mb-2"><Icon className={`w-4 h-4 text-${color}-600`} /><p className={`text-xs font-semibold text-${color}-600 uppercase`}>{label}</p></div>
    <p className="font-bold text-gray-900">{value}</p>
  </div>
);

const DocumentPreview = ({ url, loading, onLoad }: any) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2"><FileText className="w-4 h-4"/> Verification Document</h4>
      <Badge variant="outline" className="font-medium"><ImageIcon className="w-3 h-3 mr-1"/> Student ID Card</Badge>
    </div>
    {url ? (
      <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50">
        <div className="relative w-full min-h-75 flex items-center justify-center">
          {loading && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>}
          <Image src={url} alt="Document" className="max-w-full max-h-100 object-contain" onLoad={onLoad} />
        </div>
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
          <a href={url} target="_blank" rel="noopener noreferrer">
             <Button variant="secondary" size="lg"><ExternalLink className="w-5 h-5 mr-2"/> View Full Size</Button>
          </a>
        </div>
      </div>
    ) : (
      <div className="p-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No document uploaded</p>
      </div>
    )}
  </div>
);

const SectionHeader = ({ icon: Icon, title, color, bg }: any) => (
  <div className="flex items-center gap-3">
    <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
  </div>
);





const EmptyState = () => (
  <Card className="border-2 border-dashed border-gray-200 shadow-none">
    <CardContent className="py-16 text-center">
      <div className="p-4 rounded-2xl bg-gray-100 w-fit mx-auto mb-4"><FileCheck className="w-12 h-12 text-gray-400" /></div>
      <p className="text-gray-600 font-medium mb-1">No verification requests yet</p>
    </CardContent>
  </Card>
);
  export {getStatusBadge, InfoGrid, DocumentPreview, SectionHeader, EmptyState};