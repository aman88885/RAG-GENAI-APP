const CheckEmailDomainIsPersonalOrNotUtil = async (emailDomain) => {
    try {
        const personalEmailDomainsMap = new Map([
            ['gmail.com', 'Gmail'],
            ['outlook.com', 'Outlook'],
            ['yahoo.com', 'Yahoo'],
            ['protonmail.com', 'ProtonMail'],
            ['icloud.com', 'iCloud'],
            ['zoho.com', 'Zoho'],
            ['aol.com', 'AOL'],
            ['gmx.com', 'GMX'],
            ['gmx.net', 'GMX.net'],
            ['mail.com', 'Mail.com'],
            ['yandex.com', 'Yandex'],
            ['fastmail.com', 'FastMail'],
            ['tutanota.com', 'Tutanota'],
            ['hey.com', 'Hey'],
            ['hushmail.com', 'Hushmail'],
            ['lycos.com', 'Lycos'],
            ['inbox.com', 'Inbox'],
            ['mail.ru', 'Mail.ru'],
            ['rediffmail.com', 'Rediffmail'],
            ['naver.com', 'Naver'],
            ['daum.net', 'Daum'],
            ['seznam.cz', 'Seznam'],

            // Disposable / Temporary Email Providers
            ['mailinator.com', 'Mailinator'],
            ['10minutemail.com', '10 Minute Mail'],
            ['guerrillamail.com', 'Guerrilla Mail'],
            ['maildrop.cc', 'Maildrop'],
            ['trashmail.com', 'TrashMail'],
            ['tempmail.com', 'Temp Mail']
        ]);

        if (personalEmailDomainsMap.has(emailDomain)) {
            return {
                success: true,
                message: "Email domain is personal",
                companyName: personalEmailDomainsMap.get(emailDomain)
            };
        } else {
            return {
                success: false,
                message: `${emailDomain} is not a recognized personal email domain.`,
                companyName: null
            };
        }
    } catch (error) {
        console.error("Error in CheckEmailDomainIsPersonalOrNotUtil:", error);
        return {
            success: false,
            message: "Unexpected error occurred in CheckEmailDomainIsPersonalOrNotUtil.",
            error: error.message || error
        };
    }
};

module.exports = {CheckEmailDomainIsPersonalOrNotUtil};
