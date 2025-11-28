import { Injectable, Logger } from '@nestjs/common';
import { VectorStoreService } from './vector-store.service';
import { KnowledgeCategory } from './entities/knowledge-base.entity';

interface KnowledgeArticle {
  title: string;
  content: string;
  category: KnowledgeCategory;
  tags: string[];
}

@Injectable()
export class KnowledgeSeedService {
  private readonly logger = new Logger(KnowledgeSeedService.name);

  constructor(private readonly vectorStore: VectorStoreService) {}

  async seedKnowledgeBase(): Promise<void> {
    const existingCount = await this.vectorStore.getDocumentCount();
    if (existingCount > 0) {
      this.logger.log(`Knowledge base already seeded with ${existingCount} documents. Skipping...`);
      return;
    }

    this.logger.log('Seeding knowledge base with IT support articles...');

    const articles = this.getKnowledgeArticles();
    await this.vectorStore.addDocuments(articles);

    this.logger.log(`✓ Seeded ${articles.length} knowledge base articles`);
  }

  private getKnowledgeArticles(): KnowledgeArticle[] {
    return [
      {
        title: 'Active Directory Password Reset Procedure',
        content: `Standard procedure for resetting user passwords in Active Directory:

1. Open Active Directory Users and Computers (ADUC)
2. Navigate to the user's organizational unit
3. Right-click the user account and select "Reset Password"
4. Generate a secure temporary password (minimum 12 characters, mixed case, numbers, special chars)
5. Check "User must change password at next logon"
6. Communicate password securely via Teams call or encrypted email
7. Verify user can log in successfully
8. Document the password reset in the ticket

Security considerations:
- Always verify user identity before resetting password
- Use manager approval for high-privilege accounts
- Never send passwords via unencrypted email
- Log all password reset activities`,
        category: KnowledgeCategory.PASSWORD_RESET,
        tags: ['active-directory', 'password', 'security', 'identity'],
      },
      {
        title: 'Self-Service Password Reset (SSPR) Troubleshooting',
        content: `Troubleshooting guide for Azure AD Self-Service Password Reset issues:

Common issues and solutions:

1. User not registered for SSPR:
   - Direct user to https://aka.ms/ssprsetup
   - Ensure MFA methods are configured

2. SSPR not available:
   - Check SSPR is enabled for user's group in Azure AD
   - Verify licensing (Azure AD Premium P1/P2)

3. Password writeback issues:
   - Verify Azure AD Connect sync is running
   - Check password writeback is enabled
   - Review Azure AD Connect health

4. Authentication method issues:
   - Ensure phone number or email is verified
   - Check Microsoft Authenticator is configured`,
        category: KnowledgeCategory.PASSWORD_RESET,
        tags: ['azure-ad', 'sspr', 'self-service', 'mfa'],
      },
      {
        title: 'Remote System Restart via RMM',
        content: `Procedure for remotely restarting systems using RMM tools:

Pre-restart checklist:
- Verify user has saved all work
- Check for running critical processes
- Notify user of the restart (5-minute warning)
- Schedule restart outside business hours if possible

Datto RMM:
1. Navigate to device in Datto console
2. Click "Quick Actions" > "Restart"
3. Select restart type (Normal/Forced)
4. Monitor restart completion

NinjaOne:
1. Find device in NinjaOne dashboard
2. Select "Remote Tools" > "Reboot"
3. Choose immediate or scheduled
4. Verify system comes back online

ConnectWise Automate:
1. Locate computer in Control Center
2. Right-click > Commands > Restart
3. Select restart options
4. Monitor agent check-in

Post-restart verification:
- Wait for agent to report online
- Verify critical services started
- Contact user to confirm resolution`,
        category: KnowledgeCategory.SYSTEM_RESTART,
        tags: ['rmm', 'restart', 'datto', 'ninjaone', 'connectwise'],
      },
      {
        title: 'Windows Blue Screen (BSOD) Troubleshooting',
        content: `Guide for troubleshooting Windows Blue Screen of Death errors:

Common BSOD error codes:
- CRITICAL_PROCESS_DIED: Critical system process crashed
- SYSTEM_SERVICE_EXCEPTION: Driver or system service error
- IRQL_NOT_LESS_OR_EQUAL: Driver accessing invalid memory
- PAGE_FAULT_IN_NONPAGED_AREA: Memory access violation
- KERNEL_DATA_INPAGE_ERROR: Disk or memory hardware issue

Troubleshooting steps:
1. Collect BSOD error code and parameters
2. Check Windows Event Viewer for related errors
3. Review recent software/driver installations
4. Run Windows Memory Diagnostic
5. Check disk health with SMART data
6. Boot to Safe Mode to isolate driver issues
7. Update or rollback problematic drivers
8. Run SFC and DISM scans

If recurring:
- Collect memory dump files for analysis
- Consider hardware diagnostics
- Escalate to L3 if hardware failure suspected`,
        category: KnowledgeCategory.SYSTEM_RESTART,
        tags: ['bsod', 'windows', 'crash', 'drivers', 'hardware'],
      },
      {
        title: 'Backup Failure Troubleshooting Guide',
        content: `Comprehensive guide for diagnosing and resolving backup failures:

Common backup failure causes:
1. Disk space issues - Target volume full
2. Network connectivity - Cannot reach backup destination
3. Credential expiration - Service account password expired
4. VSS errors - Volume Shadow Copy service issues
5. Locked files - Files in use by applications
6. Permissions - Insufficient access to backup paths

Diagnostic steps:
1. Review backup job error logs
2. Check backup server disk space (aim for 20% free)
3. Verify network path accessibility
4. Test service account credentials
5. Check VSS writer status: vssadmin list writers
6. Review Windows Event Logs

Common resolutions:
- Clear old backups to free space
- Update backup service credentials
- Restart VSS service
- Schedule backups during off-hours
- Exclude problematic files/folders

Backup health monitoring:
- Set up alerting for backup failures
- Review backup reports daily
- Test restore procedures monthly`,
        category: KnowledgeCategory.BACKUP_FAILURE,
        tags: ['backup', 'vss', 'disaster-recovery', 'storage'],
      },
      {
        title: 'Veeam Backup Error Resolution',
        content: `Common Veeam backup errors and resolutions:

Error: "Failed to create snapshot"
- Check VMware/Hyper-V snapshot limits
- Verify sufficient datastore space
- Review CBT (Changed Block Tracking) status

Error: "Cannot connect to host"
- Verify network connectivity
- Check Veeam service account permissions
- Validate SSL certificates

Error: "RPC server unavailable"
- Check Windows Firewall rules
- Verify Remote Registry service
- Test WMI connectivity

Error: "Insufficient resources"
- Review proxy server capacity
- Check backup repository space
- Optimize job scheduling

Best practices:
- Keep Veeam updated to latest version
- Configure proper retention policies
- Use incremental backups
- Enable backup verification`,
        category: KnowledgeCategory.BACKUP_FAILURE,
        tags: ['veeam', 'virtualization', 'vmware', 'hyper-v'],
      },
      {
        title: 'New User Account Provisioning',
        content: `Standard procedure for provisioning new user accounts:

Pre-provisioning checklist:
- Verify approved HR ticket/request
- Collect user details (name, department, manager)
- Determine required access levels
- Check available licenses

Account creation steps:
1. Create Active Directory account
   - Use standard naming convention
   - Set initial password with expiry
   - Add to appropriate OUs and groups

2. Email setup
   - Create Exchange/M365 mailbox
   - Configure email aliases if needed
   - Add to distribution lists

3. Application access
   - Assign required software licenses
   - Configure SSO applications
   - Set up VPN access if remote

4. Hardware setup
   - Assign workstation/laptop
   - Configure device in RMM
   - Install required software

5. Documentation
   - Send welcome email with credentials
   - Update asset management system
   - Close provisioning ticket`,
        category: KnowledgeCategory.ACCESS_REQUEST,
        tags: ['onboarding', 'provisioning', 'active-directory', 'new-hire'],
      },
      {
        title: 'Software Deployment via RMM',
        content: `Guide for deploying software through RMM platforms:

Pre-deployment checklist:
- Verify software licensing
- Check system requirements
- Test deployment in staging
- Plan deployment window

Datto RMM deployment:
1. Upload package to Component Library
2. Create deployment policy
3. Assign to target devices/sites
4. Monitor deployment status
5. Verify installation success

Silent install switches (common):
- MSI: /qn /norestart
- EXE: /S or /silent
- Adobe: /sAll /rs
- Chrome: /silent /install

Post-deployment verification:
- Check installed programs list
- Verify application launches
- Test critical functionality
- Update software inventory

Troubleshooting failed deployments:
- Check RMM agent status
- Review deployment logs
- Verify user permissions
- Check disk space
- Test manual installation`,
        category: KnowledgeCategory.SOFTWARE_INSTALL,
        tags: ['software', 'deployment', 'rmm', 'automation'],
      },
      {
        title: 'Network Connectivity Troubleshooting',
        content: `Step-by-step guide for diagnosing network connectivity issues:

Basic connectivity tests:
1. Physical connection check
   - Verify cable connections
   - Check link lights on NIC/switch
   - Test with known-good cable

2. IP configuration
   - Run ipconfig /all
   - Verify DHCP lease or static IP
   - Check subnet mask and gateway

3. DNS resolution
   - Test: nslookup google.com
   - Verify DNS server settings
   - Try alternate DNS (8.8.8.8)

4. Gateway connectivity
   - Ping default gateway
   - Traceroute to destination
   - Check routing table

5. Firewall verification
   - Check Windows Firewall rules
   - Verify network profile
   - Test with firewall disabled

Network share access issues:
- Verify share permissions (NTFS + Share)
- Check SMB version compatibility
- Test UNC path connectivity
- Verify DNS resolution of server
- Check for offline files conflicts`,
        category: KnowledgeCategory.NETWORK_ISSUE,
        tags: ['network', 'connectivity', 'dns', 'dhcp', 'firewall'],
      },
      {
        title: 'Outlook and Exchange Troubleshooting',
        content: `Comprehensive guide for resolving Outlook and Exchange issues:

Common Outlook issues:

1. Outlook won't start:
   - Run in Safe Mode: outlook.exe /safe
   - Disable add-ins
   - Repair Office installation
   - Reset navigation pane: outlook.exe /resetnavpane

2. Send/receive errors:
   - Check internet connectivity
   - Verify Autodiscover: Ctrl+Right-click Outlook icon
   - Recreate Outlook profile
   - Check mailbox size limits

3. Performance issues:
   - Archive old emails
   - Compact OST file
   - Disable unnecessary add-ins
   - Check OST file size (limit 50GB)

4. Calendar sync issues:
   - Check folder permissions
   - Verify calendar sharing settings
   - Clear local calendar cache
   - Repair mailbox with MFCMapi

Exchange Online issues:
- Verify M365 service health
- Check user license status
- Review message trace
- Verify MX/Autodiscover records`,
        category: KnowledgeCategory.EMAIL_ISSUE,
        tags: ['outlook', 'exchange', 'm365', 'email', 'office'],
      },
      {
        title: 'VPN Connection Troubleshooting',
        content: `Guide for troubleshooting VPN connectivity issues:

Pre-checks:
- Verify internet connectivity
- Check VPN client version
- Confirm VPN credentials
- Validate VPN gateway status

Cisco AnyConnect issues:

1. Connection drops frequently:
   - Disable WiFi power saving
   - Check MTU settings
   - Update network drivers
   - Try wired connection

2. Authentication failures:
   - Verify username/password
   - Check MFA token sync
   - Validate certificate expiry
   - Review RADIUS logs

3. Cannot establish connection:
   - Check VPN gateway reachability
   - Verify firewall allows VPN traffic
   - Try alternate VPN profile
   - Check for conflicting software

Split tunnel vs full tunnel:
- Split tunnel: Only VPN traffic routed through tunnel
- Full tunnel: All traffic goes through VPN
- Check routing table for conflicts

VPN client reinstallation:
1. Uninstall existing client
2. Remove leftover registry entries
3. Delete profile files
4. Reinstall latest version
5. Import connection profile`,
        category: KnowledgeCategory.VPN_ISSUE,
        tags: ['vpn', 'anyconnect', 'remote-access', 'networking'],
      },
      {
        title: 'System Performance Optimization',
        content: `Guide for diagnosing and resolving system performance issues:

Performance diagnostics:
1. Open Task Manager (Ctrl+Shift+Esc)
2. Check CPU, Memory, Disk usage
3. Identify resource-heavy processes
4. Review Performance tab history

Common performance issues:

High CPU usage:
- Check for malware (run scan)
- Review startup programs
- Check Windows Update status
- Disable unnecessary services

High memory usage:
- Close unused applications
- Check for memory leaks
- Consider RAM upgrade
- Adjust virtual memory

Slow disk performance:
- Check disk health (SMART)
- Defragment HDD (not SSD)
- Disable indexing on slow drives
- Consider SSD upgrade

Optimization steps:
1. Run Disk Cleanup
2. Disable startup programs
3. Update device drivers
4. Check for Windows updates
5. Run SFC /scannow
6. Clear temp files
7. Disable visual effects

Preventive measures:
- Schedule regular maintenance
- Monitor resource usage
- Keep software updated
- Maintain free disk space (20%+)`,
        category: KnowledgeCategory.PERFORMANCE_ISSUE,
        tags: ['performance', 'optimization', 'cpu', 'memory', 'disk'],
      },
      {
        title: 'Printer Troubleshooting Guide',
        content: `Comprehensive guide for resolving printer issues:

Basic printer checks:
- Power and cable connections
- Paper loaded correctly
- No paper jams
- Toner/ink levels

Windows printer issues:

1. Printer offline:
   - Check network connectivity
   - Restart Print Spooler service
   - Remove and re-add printer
   - Update printer drivers

2. Print jobs stuck:
   - Clear print queue
   - Restart Print Spooler:
     net stop spooler
     del %systemroot%\\System32\\spool\\printers\\* /Q
     net start spooler

3. Print quality issues:
   - Run printer cleaning
   - Replace toner/ink
   - Check paper type settings
   - Calibrate print heads

Network printer setup:
1. Obtain printer IP address
2. Add printer by IP in Windows
3. Install correct driver
4. Configure print defaults
5. Test print

Driver installation:
- Download from manufacturer
- Use Windows Update drivers
- Consider universal print drivers
- Check 32/64-bit compatibility`,
        category: KnowledgeCategory.HARDWARE_ISSUE,
        tags: ['printer', 'hardware', 'drivers', 'print-spooler'],
      },
      {
        title: 'Microsoft Teams Troubleshooting',
        content: `Guide for resolving common Microsoft Teams issues:

Teams won't start:
1. Clear Teams cache:
   - Close Teams completely
   - Delete %appdata%\\Microsoft\\Teams
   - Restart Teams

2. Reinstall Teams:
   - Uninstall from Apps & Features
   - Delete remaining folders
   - Download fresh installer

Audio/video issues:
- Check device settings in Teams
- Update audio/video drivers
- Grant Teams camera/mic permissions
- Disable hardware acceleration

Call quality problems:
- Check internet bandwidth
- Use wired connection
- Close bandwidth-heavy apps
- Check for VPN interference

Screen sharing issues:
- Grant screen recording permission
- Disable GPU hardware acceleration
- Update graphics drivers
- Try sharing specific window

Sync issues:
- Sign out and back in
- Clear Teams cache
- Check M365 service status
- Verify account licensing`,
        category: KnowledgeCategory.GENERAL,
        tags: ['teams', 'collaboration', 'm365', 'video-conferencing'],
      },
      {
        title: 'Windows Update Troubleshooting',
        content: `Guide for resolving Windows Update issues:

Common update errors:

Error 0x80070002/0x80070003:
- Run Windows Update troubleshooter
- Reset Windows Update components
- Clear SoftwareDistribution folder

Error 0x800F0922:
- Free up disk space
- Disable VPN during update
- Check System Reserved partition

Error 0x80240034:
- Run SFC /scannow
- Run DISM repair
- Reset Windows Update

Reset Windows Update components:
1. Stop services:
   net stop wuauserv
   net stop cryptSvc
   net stop bits
   net stop msiserver

2. Rename folders:
   ren C:\\Windows\\SoftwareDistribution SoftwareDistribution.old
   ren C:\\Windows\\System32\\catroot2 catroot2.old

3. Restart services:
   net start wuauserv
   net start cryptSvc
   net start bits
   net start msiserver

WSUS considerations:
- Check WSUS server connectivity
- Verify update approvals
- Review WSUS logs
- Consider switching to Windows Update`,
        category: KnowledgeCategory.GENERAL,
        tags: ['windows-update', 'patching', 'wsus', 'maintenance'],
      },
    ];
  }
}
