import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
    ChevronRight,
    Mail,
    Calendar,
    AlertCircle,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    ShieldAlert,
    Fingerprint,
    Cpu
} from 'lucide-react';
import { LabInstance } from '../components/LabInstance';

interface Report {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    type: string;
    createdAt: string;
    author: {
        email: string;
    } | null;
    instance?: any;
}

export const AnalystDashboard = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('OPEN');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/reports?status=${filter}&limit=100`);
            setReports(response.data.data);
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [filter]);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await axios.patch(`/reports/${id}/status`, { status: newStatus });
            setFilter(newStatus); // Automatically switch to the tab where the report moved
            fetchReports();
            if (selectedReport?.id === id) {
                setSelectedReport({ ...selectedReport, status: newStatus });
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const filteredReports = reports.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.author?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': return 'bg-red-500/10 text-red-600 border-red-500/20';
            case 'HIGH': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
            case 'MEDIUM': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            default: return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
        }
    };

    const statusConfig: any = {
        'OPEN': { icon: <AlertCircle className="w-4 h-4" />, color: 'text-blue-500', bg: 'bg-blue-50' },
        'INVESTIGATING': { icon: <Clock className="w-4 h-4" />, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        'RESOLVED': { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        'DISMISSED': { icon: <XCircle className="w-4 h-4" />, color: 'text-gray-400', bg: 'bg-gray-50' }
    };

    return (
        <div className="space-y-8 animate-in">
            {/* Threat Map Integration */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 glass-card rounded-[2.5rem] bg-secondary p-8 overflow-hidden relative min-h-[400px]">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                        <div className="absolute inset-0 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:20px_20px]"></div>
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-xl">
                                    <ShieldAlert className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Geospatial Intelligence</h3>
                                    <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-[0.2em]">Active Threat Origins: Global</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[9px] font-black text-white uppercase tracking-widest">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                                    High Urgency: 12
                                </span>
                            </div>
                        </div>

                        {/* Simulated Map Grid */}
                        <div className="flex-1 grid grid-cols-12 gap-2 opacity-60">
                            {Array.from({ length: 96 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`aspect-square rounded-[4px] transition-all duration-1000 ${Math.random() > 0.9 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse' :
                                            Math.random() > 0.7 ? 'bg-emerald-500/20' : 'bg-white/5'
                                        }`}
                                ></div>
                            ))}
                        </div>

                        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                            {[
                                { label: 'Inbound Packets', val: '1.2GB/s' },
                                { label: 'Scanned Assets', val: '4,209' },
                                { label: 'Deflected Attacks', val: '864' }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-lg font-black text-white">{stat.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cyber Threat Feed */}
                <div className="glass-card rounded-[2.5rem] bg-white p-8 flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Fingerprint className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-black text-secondary uppercase tracking-tighter">Live Audit Feed</h3>
                    </div>

                    <div className="space-y-6 flex-1 overflow-hidden">
                        {[
                            { time: '14:30:22', msg: 'Unauthorized SQL probe neutralized', sector: 'SVR-04' },
                            { time: '14:28:45', msg: 'New critical report submitted', sector: 'USER-92' },
                            { time: '14:25:10', msg: 'System integrity scan complete', sector: 'SYS-MAIN' },
                            { time: '14:22:01', msg: 'Firewall policy V.12 deployed', sector: 'NET-W' }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 group">
                                <div className="flex flex-col items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                                    <div className="w-px flex-1 bg-gray-100 my-1 group-last:hidden"></div>
                                </div>
                                <div className="pb-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black text-primary/60 font-mono tracking-tighter">{item.time}</span>
                                        <span className="text-[9px] font-black bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-widest">{item.sector}</span>
                                    </div>
                                    <p className="text-xs font-bold text-secondary group-hover:translate-x-1 transition-transform">{item.msg}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-4 w-full py-4 border-t border-gray-100 text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:bg-gray-50 rounded-b-[1.5rem] transition-colors">
                        View Complete Stream
                    </button>
                </div>
            </div>

            {/* Header Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pt-8 border-t border-gray-100">
                <div>
                    <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
                        Incident <span className="text-gradient">Resolution</span>
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Active triage and forensic investigation portal</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search active reports..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all w-64 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-100 w-fit">
                {['OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${filter === status
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:text-secondary hover:bg-white'
                            }`}
                    >
                        {statusConfig[status].icon}
                        {status}
                    </button>
                ))}
            </div>

            {/* Reports Explorer */}
            {isLoading ? (
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-[2rem] bg-gray-100 animate-pulse"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredReports.map((report, idx) => (
                        <div
                            key={report.id}
                            className="glass-card p-0 rounded-[2rem] overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 border-white/40"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100/50">
                                {/* Left Section: Info */}
                                <div
                                    className="p-8 flex-1 cursor-pointer hover:bg-gray-50/30 transition-colors"
                                    onClick={() => setSelectedReport(report)}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${getPriorityStyle(report.priority)}`}>
                                            {report.priority}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {report.type}
                                        </span>
                                        {report.instance && report.instance.status !== 'TERMINATED' && (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest animate-pulse border border-emerald-500/10">
                                                <Cpu className="w-3 h-3" /> Lab Active
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-black text-secondary mb-3 group-hover:text-primary transition-colors pr-8">
                                        {report.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-2 mb-6">
                                        {report.description}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-6">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <Mail className="w-4 h-4" />
                                            {report.author ? report.author.email : 'Anonymous Source'}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <span className="ml-auto text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                            Click to Audit <ChevronRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>

                                {/* Right Section: Controls */}
                                <div className="p-8 lg:w-72 bg-gray-50/50 flex flex-col justify-center items-center gap-3">
                                    <div className={`flex items-center gap-2 mb-4 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 font-black text-[10px] uppercase tracking-widest ${statusConfig[report.status].color}`}>
                                        {statusConfig[report.status].icon}
                                        {report.status}
                                    </div>

                                    {report.status === 'OPEN' && (
                                        <Button
                                            className="w-full rounded-xl bg-primary shadow-lg shadow-primary/20 py-3 font-bold"
                                            onClick={() => updateStatus(report.id, 'INVESTIGATING')}
                                        >
                                            Begin Analysis
                                        </Button>
                                    )}

                                    {report.status === 'INVESTIGATING' && (
                                        <>
                                            <Button
                                                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 py-3 font-bold"
                                                onClick={() => updateStatus(report.id, 'RESOLVED')}
                                            >
                                                Mark Resolved
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full rounded-xl border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 py-3 font-bold"
                                                onClick={() => updateStatus(report.id, 'DISMISSED')}
                                            >
                                                Dismiss Incident
                                            </Button>
                                        </>
                                    )}

                                    <button
                                        onClick={() => setSelectedReport(report)}
                                        className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mt-2 hover:text-primary transition-colors flex items-center gap-2"
                                    >
                                        View Full Audit <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredReports.length === 0 && (
                        <div className="py-20 glass-card rounded-[2rem] text-center border-dashed border-2">
                            <ShieldAlert className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">No threats found in this sector</p>
                        </div>
                    )}
                </div>
            )}

            {/* Detailed Report Modal */}
            <Modal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                title="Intelligence Briefing"
            >
                {selectedReport && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getPriorityStyle(selectedReport.priority)}`}>
                                    {selectedReport.priority}
                                </span>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusConfig[selectedReport.status].bg} ${statusConfig[selectedReport.status].color}`}>
                                    {statusConfig[selectedReport.status].icon}
                                    {selectedReport.status}
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg">
                                ID: {selectedReport.id.slice(0, 8)}
                            </span>
                        </div>

                        <div>
                            <h3 className="text-3xl font-black text-secondary tracking-tight mb-4 leading-tight">
                                {selectedReport.title}
                            </h3>
                            <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 text-gray-600 leading-relaxed text-sm font-medium">
                                {selectedReport.description}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass-card p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                                    <Fingerprint className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Source Identity</p>
                                    <p className="text-xs font-black text-secondary">{selectedReport.author?.email || 'Anonymous SOURCE'}</p>
                                </div>
                            </div>
                            <div className="glass-card p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                                    <ShieldAlert className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Initial Sector</p>
                                    <p className="text-xs font-black text-secondary">{selectedReport.type}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Toolbar in Modal */}
                        <div className="flex items-center gap-3 p-2 bg-secondary/5 rounded-2xl border border-secondary/5">
                            {selectedReport.status === 'OPEN' && (
                                <Button
                                    className="flex-1 rounded-xl bg-primary font-bold shadow-lg shadow-primary/20"
                                    onClick={() => updateStatus(selectedReport.id, 'INVESTIGATING')}
                                >
                                    Escalate to Investigation
                                </Button>
                            )}
                            {selectedReport.status === 'INVESTIGATING' && (
                                <>
                                    <Button
                                        className="flex-1 rounded-xl bg-emerald-600 font-bold shadow-lg shadow-emerald-200"
                                        onClick={() => updateStatus(selectedReport.id, 'RESOLVED')}
                                    >
                                        Authorize Resolution
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 rounded-xl hover:bg-red-50 hover:text-red-600 font-bold"
                                        onClick={() => updateStatus(selectedReport.id, 'DISMISSED')}
                                    >
                                        Void Incident
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Discovery Instance Section */}
                        {selectedReport.status === 'INVESTIGATING' && (
                            <div className="pt-4 border-t border-gray-100">
                                <LabInstance reportId={selectedReport.id} existingInstance={selectedReport.instance} />
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};
