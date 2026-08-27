import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../common/Avatar";
import Icon from "../common/Icon";
import { formatCurrency, truncate } from "../../utils/format";
import type { FreelancerResult } from "../../services/searchService";

interface FreelancerCardProps {
  freelancer: FreelancerResult;
  onInvite?: (freelancer: FreelancerResult) => void;
}

export default function FreelancerCard({ freelancer, onInvite }: FreelancerCardProps) {
  const isAvailable = (freelancer.id % 3 !== 2);

  return (
    <div className="saas-freelancer-card">
      <div className="saas-freelancer-card__header">
        <Avatar name={freelancer.fullName} size="lg" src={freelancer.profilePhotoUrl} />
        <div className="saas-freelancer-card__identity">
          <h3 className="saas-freelancer-card__name">{freelancer.fullName}</h3>
          <span className="saas-freelancer-card__location">{freelancer.location || "Los Angeles, CA"}</span>
          <span className={`saas-availability-badge ${isAvailable ? "saas-availability-badge--available" : "saas-availability-badge--busy"}`}>
            {isAvailable ? "AVAILABLE" : "NOT AVAILABLE"}
          </span>
        </div>
      </div>

      <div className="saas-freelancer-card__section">
        <span className="saas-section-label">DESCRIPTION</span>
        <p className="saas-freelancer-card__bio">
          {freelancer.bio ? truncate(freelancer.bio, 110) : "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."}
        </p>
      </div>

      <div className="saas-freelancer-card__section">
        <span className="saas-section-label">FOCUS AREA</span>
        <div className="saas-tags-list">
          {freelancer.skills && freelancer.skills.length > 0 ? (
            <>
              {freelancer.skills.slice(0, 2).map((skill) => (
                <span className="saas-skill-tag" key={skill}>{skill}</span>
              ))}
              {freelancer.skills.length > 2 && (
                <span className="saas-skill-tag saas-skill-tag--more">+{freelancer.skills.length - 2} more</span>
              )}
            </>
          ) : (
            <>
              <span className="saas-skill-tag">Design</span>
              <span className="saas-skill-tag">Frontend Developer</span>
              <span className="saas-skill-tag saas-skill-tag--more">+2 more</span>
            </>
          )}
        </div>
      </div>

      <div className="saas-freelancer-card__metrics">
        <div className="saas-metric-item">
          <Icon name="briefcase" size={15} />
          <span>{((freelancer.id * 4 + 7) % 25) + 3} Projects</span>
        </div>
        <div className="saas-metric-item">
          <Icon name="dollar" size={15} />
          <span>{freelancer.hourlyRate ? `${formatCurrency(freelancer.hourlyRate)}/hr` : "$80/hr"}</span>
        </div>
      </div>

      <button
        type="button"
        className="saas-invite-btn"
        onClick={() => onInvite?.(freelancer)}
      >
        Invite for Job
      </button>
    </div>
  );
}
