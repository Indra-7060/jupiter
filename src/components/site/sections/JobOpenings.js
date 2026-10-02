import { getJobs } from '@/lib/content';
import JobsList from '../JobsList';

export default async function JobOpenings({ data }) {
  const jobs = await getJobs();
  return (
    <section className="jobs">
      <div className="wrap">
        {data.kicker && <span className="kick">{data.kicker}</span>}
        {data.heading && <h2>{data.heading}</h2>}
        {data.text && <p className="lead">{data.text}</p>}
        <JobsList jobs={jobs} applyLabel={data.applyLabel || 'Apply Now'} emptyText={data.emptyText} successMessage={data.successMessage} />
      </div>
    </section>
  );
}
