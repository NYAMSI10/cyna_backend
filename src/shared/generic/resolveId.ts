import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Types, isValidObjectId } from 'mongoose';

type IdDoc = { _id: Types.ObjectId };

export async function resolveIdsOrThrow(
  requestedIds: string[] | undefined,
  finder: (ids: string[]) => Promise<IdDoc[]>,
  label: string,
): Promise<Types.ObjectId[]> {
  if (!requestedIds?.length) return [];

  // Gestion du cas où les IDs arrivent sous forme de string JSON
  let ids = Array.isArray(requestedIds) ? requestedIds : [];
  if (typeof requestedIds === 'string') {
    try {
      ids = JSON.parse(requestedIds);
    } catch {
      throw new BadRequestException(`Format d'IDs ${label} invalide`);
    }
  }

  // 1. Nettoyage : on enlève les doublons pour éviter les erreurs de compte
  const uniqueIds = [...new Set(ids)];

  // 2. Validation du format MongoDB
  const invalid = uniqueIds.filter((id) => !isValidObjectId(id));
  if (invalid.length) {
    throw new BadRequestException(
      `ID(s) ${label} invalides: ${invalid.join(', ')}`,
    );
  }

  // 3. Vérification en base de données
  const found = await finder(uniqueIds);

  if (found.length !== uniqueIds.length) {
    const foundSet = new Set(found.map((d) => d._id.toString()));
    const missing = uniqueIds.filter((id) => !foundSet.has(id));
    throw new NotFoundException(
      `${capitalize(label)} inexistants: ${missing.join(', ')}`,
    );
  }

  return uniqueIds.map((id) => new Types.ObjectId(id));
}

export async function resolveIdOrThrow(
  requestedId: string | undefined,
  finder: (id: string) => Promise<IdDoc | null>,
  label: string,
): Promise<Types.ObjectId | null> {
  // On retourne null si pas d'ID, pour les champs optionnels
  if (!requestedId) return null;

  if (!isValidObjectId(requestedId)) {
    throw new BadRequestException(`ID ${label} invalide: ${requestedId}`);
  }

  const found = await finder(requestedId);
  if (!found) {
    throw new NotFoundException(
      `${capitalize(label)} inexistant: ${requestedId}`,
    );
  }

  return new Types.ObjectId(requestedId);
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
