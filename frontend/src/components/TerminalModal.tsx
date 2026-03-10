import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { X, Maximize2, Minimize2, Terminal as TerminalIcon } from 'lucide-react';

interface TerminalModalProps {
    isOpen: boolean;
    onClose: () => void;
    instanceName: string;
}

export const TerminalModal: React.FC<TerminalModalProps> = ({ isOpen, onClose, instanceName }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerminal | null>(null);
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        if (isOpen && terminalRef.current && !xtermRef.current) {
            const term = new XTerminal({
                cursorBlink: true,
                theme: {
                    background: '#1a1a1a',
                    foreground: '#10b981',
                    cursor: '#10b981',
                    selectionBackground: 'rgba(16, 185, 129, 0.3)',
                },
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, "Courier New", monospace',
            });

            const fitAddon = new FitAddon();
            term.loadAddon(fitAddon);
            term.open(terminalRef.current);
            fitAddon.fit();

            xtermRef.current = term;

            // Welcom Message
            term.writeln('\x1b[1;32mWelcome to V-CTRIP Forensic Terminal v1.0.0\x1b[0m');
            term.writeln(`\x1b[1;34mConnected to: ${instanceName}\x1b[0m`);
            term.writeln('\x1b[90mType "help" for available forensic commands.\x1b[0m');
            term.writeln('');
            term.write('\x1b[1;32manalyst@vctrip-lab\x1b[0m:\x1b[1;34m~\x1b[0m$ ');

            let currentLine = '';

            term.onData((data) => {
                const code = data.charCodeAt(0);
                if (code === 13) { // Enter
                    term.writeln('');
                    handleCommand(currentLine, term);
                    currentLine = '';
                    term.write('\x1b[1;32manalyst@vctrip-lab\x1b[0m:\x1b[1;34m~\x1b[0m$ ');
                } else if (code === 127) { // Backspace
                    if (currentLine.length > 0) {
                        currentLine = currentLine.slice(0, -1);
                        term.write('\b \b');
                    }
                } else {
                    currentLine += data;
                    term.write(data);
                }
            });
        }

        return () => {
            if (!isOpen && xtermRef.current) {
                xtermRef.current.dispose();
                xtermRef.current = null;
            }
        };
    }, [isOpen, instanceName]);

    const handleCommand = (cmd: string, term: XTerminal) => {
        const command = cmd.trim().toLowerCase();
        const args = cmd.trim().split(' ').slice(1);

        if (command === 'help') {
            term.writeln('\x1b[1;36mForensic Utility Help\x1b[0m');
            term.writeln('  nmap [target]      - Network discovery & port scanning');
            term.writeln('  whois [domain]     - Domain registration & IP ownership');
            term.writeln('  log-analyze [file] - Scan logs for indicator of compromise (IOC)');
            term.writeln('  cat [file]         - Read evidence metadata');
            term.writeln('  ls                 - List evidence artifacts');
            term.writeln('  ps                 - Active forensic processes');
            term.writeln('  clear              - Wipe terminal display');
        } else if (command === 'ls') {
            term.writeln('\x1b[34mREADME.md\x1b[0m  \x1b[32mforensics_tools/\x1b[0m  \x1b[33mevidence/\x1b[0m  \x1b[31martifacts/\x1b[0m');
        } else if (command.startsWith('nmap')) {
            const target = args[0] || '127.0.0.1';
            term.writeln(`Starting Nmap 7.92 ( https://nmap.org ) at ${new Date().toISOString()}`);
            term.writeln(`Nmap scan report for ${target}`);
            term.writeln(`Host is up (0.0024s latency).`);
            term.writeln(`Not shown: 996 closed tcp ports (reset)`);
            term.writeln(`PORT     STATE SERVICE`);
            term.writeln(`22/tcp   open  ssh`);
            term.writeln(`80/tcp   open  http`);
            term.writeln(`443/tcp  open  https`);
            term.writeln(`3306/tcp open  mysql`);
            term.writeln(`\nNmap done: 1 IP address (1 host up) scanned in 0.45 seconds`);
        } else if (command.startsWith('whois')) {
            const target = args[0] || 'veritas.edu.ng';
            term.writeln(`Domain Name: ${target.toUpperCase()}`);
            term.writeln(`Registry Domain ID: 123456789_vctrip`);
            term.writeln(`Registrar WHOIS Server: whois.nic.ng`);
            term.writeln(`Registrar: Veritas University ICT Centre`);
            term.writeln(`Registry Expiry Date: 2030-01-01T00:00:00Z`);
            term.writeln(`Admin Email: security@veritas.edu.ng`);
            term.writeln(`Status: ACTIVE / PROTECTED`);
        } else if (command.startsWith('log-analyze')) {
            term.writeln('\x1b[1;33m[!] Scanning for IOCs (Indicators of Compromise)...\x1b[0m');
            setTimeout(() => {
                term.writeln('\x1b[32m[+] Log integrity check: PASSED\x1b[0m');
                term.writeln('\x1b[31;1m[!] ALERT: Detected 12 failed SSH attempts from 185.22.x.x (Brute Force Pattern)\x1b[0m');
                term.writeln('\x1b[31;1m[!] ALERT: SQL Injection pattern found in web_access.log:4432\x1b[0m');
                term.writeln('\x1b[33m[*] Recommendation: Block source IP 185.22.x.x and rotate DB credentials.\x1b[0m');
            }, 800);
        } else if (command.startsWith('apt install')) {
            const tool = args[1];
            if (!tool) {
                term.writeln('E: Package name missing');
            } else {
                term.writeln(`Reading package lists... Done`);
                term.writeln(`Building dependency tree... Done`);
                term.writeln(`0 upgraded, 1 newly installed, 0 to remove.`);
                term.writeln(`Unpacking ${tool}...`);
                term.writeln(`\x1b[1;32mDone! ${tool} is now ready for use.\x1b[0m`);
            }
        } else if (command === 'whoami') {
            term.writeln('v-ctrip-analyst');
        } else if (command === 'cat readme.md') {
            term.writeln('\x1b[1;34m# V-CTRIP FORENSIC SANDBOX v1.0.0\x1b[0m');
            term.writeln('This environment is strictly for evidence analysis.');
            term.writeln('All activities are logged to the central audit system.');
            term.writeln('\x1b[33mCAUTION:\x1b[0m Execution environment is ephemeral.');
        } else if (command === 'clear') {
            term.clear();
        } else if (command === '') {
            // Do nothing
        } else {
            term.writeln(`-vctrip-bash: ${command}: command not found`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed z-[200] transition-all duration-300 flex flex-col bg-[#1a1a1a] border border-white/10 shadow-2xl rounded-2xl overflow-hidden ${isMaximized ? 'inset-0' : 'bottom-6 right-6 w-[800px] h-[500px]'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-secondary border-b border-white/5 cursor-move">
                <div className="flex items-center gap-3">
                    <TerminalIcon className="w-5 h-5 text-emerald-500" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Forensic Shell | {instanceName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMaximized(!isMaximized)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 transition-colors">
                        {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button onClick={onClose} className="p-1.5 hover:bg-red-500/20 hover:text-red-500 rounded-lg text-gray-400 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Terminal Body */}
            <div ref={terminalRef} className="flex-1 p-4 bg-[#1a1a1a]" />
        </div>
    );
};
