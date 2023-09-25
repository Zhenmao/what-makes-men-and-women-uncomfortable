d3.csv("data.csv", d3.autoType).then((csv) => {
  const data = processData(csv);

  new ClampedBarChart({
    el: document.querySelector("#chart"),
    data,
    groupKeyAccessor: (d) => d.key,
    groupValuesAccessor: (d) => d.values,
    keyAccessor: (d) => d.key,
    xDomain: [0, 1],
    xAccessor: (d) => d.value,
    xTickFormat: (d) =>
      [0, 0.2, 0.4, 0.6, 0.8, 1].includes(d) ? d3.format("~%")(d) : "•",
    xValueFormat: d3.format(".1~%"),
  });
});

function processData(csv) {
  return csv.map((d, i) => ({
    key: d.Question,
    values: [
      {
        key: "men",
        name: "Men",
        value: d.Men,
      },
      {
        key: "women",
        name: "Women",
        value: d.Women,
      },
    ],
  }));
}
