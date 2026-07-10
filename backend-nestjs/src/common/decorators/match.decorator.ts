import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Validador custom que verifica que el valor de una propiedad
 * coincide con el valor de otra propiedad del mismo objeto.
 *
 * @example
 * class ResetPasswordDto {
 *   password: string;
 *
 *   @Match('password', { message: 'Las contraseñas no coinciden' })
 *   password_confirmation: string;
 * }
 */
export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} debe coincidir con ${relatedPropertyName}`;
        },
      },
    });
  };
}
