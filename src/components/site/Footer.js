import SmartLink from './SmartLink';
import Ghost from './Ghost';

const SOCIAL = {
  facebook: 'M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.3c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.500-4 4.100v2.200H8v3.300h2.600V21H14v-9.200h2.500l.4-3.300z',
  instagram:
    'M12 7.500a4.500 4.500 0 100 9 4.500 4.500 0 000-9zm0 7.400a2.900 2.900 0 110-5.800 2.900 2.900 0 010 5.800zM17.300 5.500a1.100 1.100 0 100 2.200 1.100 1.100 0 000-2.200zM12 2.500c-2.600 0-2.900 0-3.900.1-2.600.1-4.200 1.600-4.300 4.300C3.700 8 3.700 8.300 3.700 12s0 4 .1 5c.1 2.600 1.600 4.200 4.300 4.300 1 .1 1.300.1 3.900.1s2.900 0 3.900-.1c2.600-.1 4.200-1.600 4.300-4.300.1-1 .1-1.300.1-5s0-4-.1-5c-.1-2.600-1.600-4.200-4.300-4.300-1-.1-1.300-.1-3.900-.1zm0 1.600c2.600 0 2.800 0 3.800.1 1.700.1 2.700 1 2.800 2.800.1 1 .1 1.300.1 3s0 2-.1 3c-.1 1.800-1.100 2.700-2.800 2.800-1 .1-1.200.1-3.800.1s-2.800 0-3.800-.1c-1.700-.1-2.700-1-2.800-2.800-.1-1-.1-1.300-.1-3s0-2 .1-3c.1-1.800 1.100-2.700 2.800-2.800 1-.1 1.200-.1 3.800-.1z',
  linkedin:
    'M4.500 8.800h3.700V20H4.500zM6.400 3.200a2.100 2.100 0 110 4.200 2.100 2.100 0 010-4.200zM10.400 8.800H14v1.600c.5-.9 1.700-1.900 3.600-1.900 3.800 0 4.500 2.500 4.500 5.700V20h-3.700v-5.300c0-1.300 0-2.900-1.800-2.900s-2 1.400-2 2.800V20h-3.700z',
  youtube:
    'M21.600 7.200c-.2-.9-.9-1.500-1.800-1.700C18.200 5.100 12 5.100 12 5.100s-6.200 0-7.800.4c-.9.200-1.600.8-1.800 1.700C2 8.800 2 12 2 12s0 3.200.4 4.800c.2.900.9 1.500 1.800 1.700 1.600.4 7.800.4 7.800.4s6.200 0 7.800-.4c.9-.2 1.600-.8 1.800-1.700.4-1.600.4-4.800.4-4.800s0-3.200-.4-4.800zM10 15V9l5.200 3z',
};

export default function Footer({ settings = {} }) {
  const { site = {}, footer = {}, contact = {}, social = {} } = settings;
  const year = new Date().getFullYear();
  const copyright = (footer.copyright || '© {year} All rights reserved.').replace('{year}', String(year));
  const socials = Object.entries(SOCIAL).filter(([k]) => social[k]);

  return (
    <footer className="jf">
      <div className="in">
        <div className="cols">
          <div className="lg">
            <SmartLink href="/">
              <img src={site.logo || '/images/logo.png'} alt={site.logoAlt || site.name || ''} />
            </SmartLink>
            {footer.about && <p>{footer.about}</p>}
            {socials.length > 0 && (
              <div className="so">
                {socials.map(([k, d]) => (
                  <a key={k} href={social[k]} aria-label={k[0].toUpperCase() + k.slice(1)} target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24">
                      <path d={d} />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="lk">
            <h5>Links</h5>
            <ul>
              {(footer.links || []).map((l, i) => (
                <li key={i}>
                  <SmartLink href={l.href}>{l.label}</SmartLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="pr">
            <h5>Products</h5>
            <ul>
              {(footer.productLinks || []).map((l, i) => (
                <li key={i}>
                  <SmartLink href={l.href}>{l.label}</SmartLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="ct">
            <h5>Contact Us</h5>
            <ul>
              {(contact.company || contact.address) && (
                <li>
                  <svg viewBox="0 0 24 24">
                    <path d="M12 21s-7-6.200-7-11.500a7 7 0 0114 0C19 14.800 12 21 12 21z" />
                    <circle cx="12" cy="9.500" r="2.600" />
                  </svg>
                  <span>
                    {contact.company}
                    {contact.company && contact.address && <br />}
                    {contact.address}
                  </span>
                </li>
              )}
              {contact.phone && (
                <li>
                  <svg viewBox="0 0 24 24">
                    <path d="M5 3.500h3.500l1.800 4.500-2.300 1.500a11 11 0 006 6l1.500-2.300 4.500 1.800V19a2 2 0 01-2 2C10.200 21 3 13.800 3 5.500a2 2 0 012-2z" />
                  </svg>
                  <a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`}>{contact.phone}</a>
                </li>
              )}
              {contact.email && (
                <li>
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="5" width="18" height="14" rx="1.500" />
                    <path d="M3.500 6l8.500 7 8.500-7" />
                  </svg>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div className="cp">{copyright}</div>
      {footer.ghostText && <Ghost className="gt" text={footer.ghostText} />}
    </footer>
  );
}
