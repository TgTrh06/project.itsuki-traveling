import { useLayoutEffect, useState, useRef, useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_japanLow from "@amcharts/amcharts5-geodata/japanLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { useNavigate } from "react-router-dom";

type RegionData = { name?: string };
const regionNameOf = (polygon: am5map.MapPolygon) =>
  (polygon.dataItem?.dataContext as RegionData | undefined)?.name ?? "";

export default function JapanMap({ slug, hoveredDestSlug }: { slug: string; hoveredDestSlug: string | null }) {
  const navigate = useNavigate();
  // State to track the currently selected polygon
  const [selectedPolygon, setSelectedPolygon] = useState<am5map.MapPolygon | null>(null);
  const polygonSeriesRef = useRef<am5map.MapPolygonSeries | null>(null);
  const polygonsMapRef = useRef<Record<string, am5map.MapPolygon>>({});

  useLayoutEffect(() => {
    const root = am5.Root.new("japanMapDiv");
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "translateX",
        panY: "translateY",
        wheelY: "zoom",
        projection: am5map.geoMercator(),
      })
    );

    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_japanLow,
      })
    );

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
      fill: am5.color(0xffffff),
      stroke: am5.color(0x16a34a),
      strokeWidth: 1.5,
      cursorOverStyle: "pointer",
    });

    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0x16a34a),
      strokeWidth: 2,
    });

    // Tô màu vùng được chọn
    polygonSeries.events.on("datavalidated", () => {
      polygonSeries.mapPolygons.each((polygon) => {
        const name = regionNameOf(polygon).toLowerCase().replace(/\s+/g, "-");
        polygonsMapRef.current[name] = polygon;
        if (name === slug) {
          polygon.set("fill", am5.color(0x16a34a));
          setSelectedPolygon(polygon);
        }
      });
    });

    polygonSeriesRef.current = polygonSeries;

    // Hover logic: giữ màu vùng được chọn khi không hover
    polygonSeries.mapPolygons.template.events.on("pointerout", () => {
      if (selectedPolygon) {
        selectedPolygon.set("fill", am5.color(0x16a34a)); // khôi phục màu vùng được chọn
      }
    });

    // Click để điều hướng
    polygonSeries.mapPolygons.template.events.on("click", function (ev) {
      const regionName = regionNameOf(ev.target);
      const regionSlug = regionName.toLowerCase().replace(/\s+/g, "-");
      navigate(`/destinations/${regionSlug}`);
    });

    return () => root.dispose();
  }, [navigate, slug]);

  // Effect riêng để xử lý hover
  useEffect(() => {
    if (!polygonSeriesRef.current) return;

    if (hoveredDestSlug) {
      const hoveredPolygon = polygonsMapRef.current[hoveredDestSlug];
      polygonSeriesRef.current.mapPolygons.each((polygon) => {
        if (polygon === hoveredPolygon) {
          polygon.set("fill", am5.color(0x16a34a));
          polygon.set("strokeWidth", 2.5);
        } else if (polygon !== selectedPolygon) {
          polygon.set("fill", am5.color(0xffffff));
          polygon.set("strokeWidth", 1.5);
        }
      });
    } else {
      // Khôi phục khi không hover
      polygonSeriesRef.current.mapPolygons.each((polygon) => {
        if (polygon === selectedPolygon) {
          polygon.set("fill", am5.color(0x16a34a));
          polygon.set("strokeWidth", 1.5);
        } else {
          polygon.set("fill", am5.color(0xffffff));
          polygon.set("strokeWidth", 1.5);
        }
      });
    }
  }, [hoveredDestSlug, selectedPolygon]);

  return <div id="japanMapDiv" className="w-full h-[600px] rounded-lg shadow-md" />;
}
