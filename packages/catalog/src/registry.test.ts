import { describe, expect, it } from "vitest";
import {
  validateDataCoordinateDefinition,
  validateCatalogCollection,
  validateComponentManifest,
  validateInteractiveMediaDefinition,
} from "@didact/schema";

import {
  availableCollections,
  availableManifests,
  dataCoordinateFixtures,
  interactiveMediaFixtures,
  interactiveMediaManifest,
  dataExplorerManifest,
  plannedManifests,
} from "./index";
import { availableTypes, catalog, designCatalog, getAvailableManifest, getDesignManifest } from "./registry";

describe("component manifest registry", () => {
  it("satisfies the canonical manifest contract", () => {
    for (const manifest of designCatalog) {
      const result = validateComponentManifest(manifest);

      expect(result.issues, manifest.id).toEqual([]);
      expect(result.success, manifest.id).toBe(true);
    }
  });

  it("uses unique, stable identifiers", () => {
    const ids = designCatalog.map((manifest) => manifest.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => /^didact\.[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))).toBe(true);
  });

  it("uses semantic manifest versions", () => {
    expect(designCatalog.every((manifest) => /^\d+\.\d+\.\d+$/.test(manifest.version.schema))).toBe(true);
    expect(availableManifests.every((manifest) => manifest.version.component.startsWith("1."))).toBe(true);
    expect(plannedManifests.every((manifest) => manifest.version.component.startsWith("0."))).toBe(true);
  });

  it("keeps mappings explicit even when no standard interaction applies", () => {
    for (const manifest of designCatalog) {
      const qti = manifest.mappings?.qti;
      const xapi = manifest.mappings?.xapi;
      const qtiMappings = qti ? Array.isArray(qti) ? qti : [qti] : [];
      const xapiMappings = xapi ? Array.isArray(xapi) ? xapi : [xapi] : [];
      for (const mapping of [...qtiMappings, ...xapiMappings]) {
        expect(mapping.notes?.length).toBeGreaterThan(0);
      }
    }
  });

  it("never exports planned drafts through the available catalog", () => {
    expect(catalog).toEqual(availableManifests);
    expect(catalog.every((manifest) => manifest.lifecycle.availability === "available")).toBe(true);
    expect(getAvailableManifest("didact.practice-set")?.lifecycle.maturity).toBe("stable");
    expect(getDesignManifest("didact.practice-set")?.lifecycle.availability).toBe("available");
  });

  it("describes 34 distinct public educational types without counting foundations or recipes", () => {
    const typeIds = availableTypes.map(({ id }) => id);
    const exportNames = availableTypes.map(({ exportName }) => exportName);
    const representedManifests = new Set(availableTypes.map(({ manifestId }) => manifestId));

    expect(availableTypes).toHaveLength(34);
    expect(new Set(typeIds).size).toBe(34);
    expect(new Set(exportNames).size).toBe(34);
    expect(representedManifests).toEqual(new Set(availableManifests.map(({ id }) => id)));
  });

  it("validates unique collections against available manifests and type ids", () => {
    const collectionIds = availableCollections.map(({ id }) => id);
    const slugs = availableCollections.map(({ slug }) => slug);
    const typeIds = new Set(availableTypes.map(({ id }) => id));

    expect(new Set(collectionIds).size).toBe(collectionIds.length);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const collection of availableCollections) {
      const result = validateCatalogCollection(collection, availableManifests);
      expect(result.issues, collection.id).toEqual([]);
      expect(result.success, collection.id).toBe(true);
      for (const item of collection.items) {
        if ("typeId" in item && item.typeId) expect(typeIds.has(item.typeId)).toBe(true);
      }
    }
  });

  it("classifies every available manifest with structured facets", () => {
    for (const manifest of availableManifests) {
      expect(manifest.facets.subjects.length, manifest.id).toBeGreaterThan(0);
      expect(manifest.facets.representations.length, manifest.id).toBeGreaterThan(0);
      expect(manifest.facets.learnerActions.length, manifest.id).toBeGreaterThan(0);
      expect(manifest.facets.purposes.length, manifest.id).toBeGreaterThan(0);
    }
  });

  it("publishes Interactive Media as an explicitly experimental contract", () => {
    expect(interactiveMediaManifest.lifecycle).toEqual({ availability: "available", maturity: "experimental" });
    expect(catalog.map(({ id }) => String(id))).toContain(interactiveMediaManifest.id);
    expect(designCatalog.some(({ id }) => id === interactiveMediaManifest.id)).toBe(true);
  });

  it("publishes one experimental Data Explorer instead of duplicating Function Explorer", () => {
    expect(dataExplorerManifest.lifecycle).toEqual({ availability: "available", maturity: "experimental" });
    expect(catalog.map(({ id }) => String(id))).toContain(dataExplorerManifest.id);
    expect(availableTypes.filter(({ exportName }) => exportName === "DataExplorer")).toHaveLength(1);
    expect(availableTypes.map(({ exportName }) => String(exportName))).not.toContain("FunctionExplorer");
  });

  it("validates contrasting function and business time-series recipes", () => {
    expect(dataCoordinateFixtures.map(({ series }) => series[0]?.source.kind)).toEqual(["function", "points"]);
    expect(dataCoordinateFixtures.map(({ axes }) => axes.x.domain.scale)).toEqual(["linear", "time"]);
    for (const fixture of dataCoordinateFixtures) {
      const result = validateDataCoordinateDefinition(fixture);
      expect(result.issues, fixture.id).toEqual([]);
      expect(result.success, fixture.id).toBe(true);
      expect(fixture.table.source).toBe("series");
    }
  });

  it("validates two contrasting Interactive Media fixtures and their child references", () => {
    const manifestIds = new Set(availableManifests.map(({ id }) => id));
    expect(interactiveMediaFixtures.map(({ media }) => media.kind)).toEqual(["video", "audio"]);
    for (const fixture of interactiveMediaFixtures) {
      const result = validateInteractiveMediaDefinition(fixture);
      expect(result.issues, fixture.id).toEqual([]);
      expect(result.success, fixture.id).toBe(true);
      for (const checkpoint of fixture.checkpoints) {
        expect(manifestIds.has(checkpoint.activity.manifestId), checkpoint.activity.manifestId).toBe(true);
      }
    }
  });
});
