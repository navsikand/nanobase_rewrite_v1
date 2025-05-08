import Link from "next/link";

export default function AboutUs() {
  return (
    <div className="">
      {/* Header text */}
      <div className="mx-auto mt-20 flex w-11/12 flex-col items-center justify-center lg:w-[65%]">
        <div>
          <p className="-ml-6 text-2xl font-light">Welcome to</p>
          <h1 className="ml-6 text-6xl font-bold">Nanobase</h1>
        </div>

        <div className="mt-8 w-full space-y-3">
          <h2 className="text-4xl font-semibold">Who we are</h2>
          <div className="mt-3 space-y-2">
            <p>
              Nanobase is developed and maintained by Navraj Sikand and Subhajit
              Roy of Petr Šulc and Hao Yan&apos;s labs at Arizona State
              University. Our labs have extensive experience in nanostructure
              design, experiments, and simulation, and also dedicate significant
              effort to tool and methods development to make the nanostructure
              design process easier. Any inquiries should be directed to
              oxdna.help@gmail.com We gratefully acknowledge NSF grant no.
              1931487 which funds the server development.
              <br /> Citation for Nanobase: Erik Poppleton, Aatmik Mallya,
              Swarup Dey, Joel Joseph, Petr Šulc, Nanobase.org: a repository for
              DNA and RNA nanostructures, Nucleic Acids Research, 2021;,
              gkab1000, https://doi.org/10.1093/nar/gkab1000
            </p>
          </div>
          <h2 className="text-4xl font-semibold">Disclaimer and Copyright</h2>
          <div className="mt-3 space-y-2">
            <p>
              The nanobase.org web application is provided by the copyright
              holders and contributors &quot;as is&quot; and any express or
              implied warranties, including, but not limited to, the implied
              warranties of merchantability and fitness for a particular purpose
              are disclaimed. In no event shall the copyright holder or
              contributors be liable for any direct, indirect, incidental,
              special, exemplary, or consequential damages (including, but not
              limited to, procurement of substitute goods or services; loss of
              use, data, or profits; or business interruption) however caused
              and on any theory of liability, whether in contract, strict
              liability, or tort (including negligence or otherwise) arising in
              any way out of the use of the nanobase.org web application, even
              if advised of the possibility of such damage. Please note that the
              copyright for the deposited structures is owned by the authors of
              the publications where the structures were introduced, and we ask
              you to refer to the respective publications linked in the
              structure description for further information about patents and
              copyrights related to the structure.
            </p>
          </div>
          <h2 className="text-4xl font-semibold">Contact us</h2>
          <div className="mt-3 space-y-2">
            <p>
              For any requests or queries please contact us at{" "}
              <Link href="mailto:oxdna.help@gmail.com">
                oxdna.help@gmail.com
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
