export default function Vision({ data }) {
  return (
    <section className="vis2">
      {data.image && <img src={data.image} alt="" data-px="vis" />}
      <div className="c">
        <h2 className="rv l">{data.heading}</h2>
        <p className="rv r">{data.text}</p>
      </div>
    </section>
  );
}
