import { ICONS } from '@/lib/icons';

export default function Icon({ name, className }) {
  const icon = ICONS[name] || ICONS.check;
  return <svg className={className} viewBox={icon.viewBox} dangerouslySetInnerHTML={{ __html: icon.body }} />;
}

export function GearIcon() {
  return <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: ICONS.gear.body }} />;
}
