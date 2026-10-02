import HeroVideo from './sections/HeroVideo';
import Marquee from './sections/Marquee';
import Divisions from './sections/Divisions';
import Vision from './sections/Vision';
import Mission from './sections/Mission';
import Crafting from './sections/Crafting';
import BuiltToScale from './sections/BuiltToScale';
import AboutHero from './sections/AboutHero';
import Expertise from './sections/Expertise';
import Journey from './sections/Journey';
import Certifications from './sections/Certifications';
import PageTitle from './sections/PageTitle';
import ProductGrid from './sections/ProductGrid';
import MachinesGrid from './sections/MachinesGrid';
import MachineFeature from './sections/MachineFeature';
import PressList from './sections/PressList';
import ContactLocations from './sections/ContactLocations';
import ContactForm from './sections/ContactForm';
import RichText from './sections/RichText';
import JobOpenings from './sections/JobOpenings';
import CvForm from './sections/CvForm';
import IndustriesList from './sections/IndustriesList';
import CtaBanner from './sections/CtaBanner';

const MAP = {
  hero_video: HeroVideo,
  marquee: Marquee,
  divisions: Divisions,
  vision: Vision,
  mission: Mission,
  crafting: Crafting,
  built_to_scale: BuiltToScale,
  about_hero: AboutHero,
  expertise: Expertise,
  journey: Journey,
  certifications: Certifications,
  page_title: PageTitle,
  product_grid: ProductGrid,
  machines_grid: MachinesGrid,
  machine_feature: MachineFeature,
  press_list: PressList,
  contact_locations: ContactLocations,
  contact_form: ContactForm,
  rich_text: RichText,
  job_openings: JobOpenings,
  cv_form: CvForm,
  industries_list: IndustriesList,
  cta_banner: CtaBanner,
};

/** About-page sections that the original design wraps in a `.c` container. */
const WRAP_IN_C = new Set(['about_hero', 'expertise', 'certifications']);

export default function SectionRenderer({ sections = [] }) {
  const out = [];
  let i = 0;
  while (i < sections.length) {
    const s = sections[i];
    const Comp = MAP[s.type];
    if (!Comp) {
      i++;
      continue;
    }
    if (WRAP_IN_C.has(s.type)) {
      // group consecutive wrapped sections into one `.c` container
      const group = [];
      while (i < sections.length && WRAP_IN_C.has(sections[i].type) && MAP[sections[i].type]) {
        group.push(sections[i]);
        i++;
      }
      out.push(
        <div className="c" key={`c-${group[0].id}`}>
          {group.map((g) => {
            const C = MAP[g.type];
            return <C key={g.id} data={g.data || {}} />;
          })}
        </div>
      );
      continue;
    }
    out.push(<Comp key={s.id} data={s.data || {}} />);
    i++;
  }
  return <>{out}</>;
}
