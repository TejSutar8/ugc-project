import { useEffect, useState } from "react";
import type { Project } from "../types";
import { dummyGenerations } from "../assets/assets";

const Community = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setTimeout(() => {
      setProjects(dummyGenerations);
      setLoading(false);
    }, 3000);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return loading ? (
  <div>

  </div> ): (
  <div>

  </div>);
};

export default Community;
