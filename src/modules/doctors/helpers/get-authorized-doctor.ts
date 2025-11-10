import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { UserRole } from 'src/enums/user.enums';

import { Doctor } from '../doctor.entity';
import { Clinic } from 'src/modules/clinics/clinic.entity';

export async function getAuthorizedDoctor(
  id: string,
  userId: string,
  role: string,
  doctorRepo: Repository<Doctor>,
  clinicRepo: Repository<Clinic>,
  findOneDoctor: (id: string) => Promise<Doctor>,
): Promise<Doctor> {
  if (role === UserRole.ADMIN) {
    const doctor = await findOneDoctor(id);
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  const clinic = await clinicRepo.findOne({
    where: { user: { id: userId } },
  });
  if (!clinic) throw new NotFoundException('Clinic not found for this user');

  const doctor = await doctorRepo.findOne({
    where: { id, clinic: { id: clinic.id } },
  });
  if (!doctor)
    throw new ForbiddenException(
      'You cannot modify a doctor not in your clinic',
    );

  return doctor;
}
